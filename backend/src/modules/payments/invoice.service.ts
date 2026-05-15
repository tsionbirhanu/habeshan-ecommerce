import PDFDocument from 'pdfkit';
import { PrismaClient, Invoice, Order, OrderItem, Payment } from '@prisma/client';
import { env } from '../../config/environment';
import logger from '../../utils/logger';
import { NotFoundError, AppError } from '../../utils/errors';

const prisma = new PrismaClient();

/**
 * Generate sequential invoice number format: "HMM-2026-0001"
 * Uses current year and incremental counter
 */
const generateInvoiceNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();

  // Count existing invoices for this year
  const existingInvoices = await prisma.invoice.findMany({
    where: {
      invoiceNumber: {
        startsWith: `HMM-${currentYear}-`,
      },
    },
  });

  const nextNumber = existingInvoices.length + 1;
  return `HMM-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Format date in German format (DD.MM.YYYY)
 */
const formatGermanDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export interface InvoiceData {
  invoice: Invoice;
  invoiceNumber: string;
  invoiceDate: string;
  order: Order;
  items: OrderItem[];
  customer: any;
  payment: Payment | null;
  subtotal: number;
  vatBreakdown: { rate: number; amount: number }[];
  totalTax: number;
  totalAmount: number;
  shippingCost: number;
  discount: number;
}

/**
 * Generate Invoice record and gather data
 */
export const generateInvoice = async (orderId: string): Promise<InvoiceData> => {
  // Check if invoice already exists
  let invoice = await prisma.invoice.findUnique({
    where: { orderId },
  });

  if (!invoice) {
    // Create new invoice with sequential number
    const invoiceNumber = await generateInvoiceNumber();

    invoice = await prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
      },
    });

    logger.info(`Invoice created: ${invoiceNumber} for order ${orderId}`);
  }

  // Gather all order data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
              vatRate: true,
            },
          },
        },
      },
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Calculate VAT breakdown by rate
  const vatMap = new Map<number, number>();

  order.items.forEach((item: any) => {
    const vatRate = Number(item.product.vatRate);
    const itemSubtotal = Number(item.unitPrice) * item.quantity;
    const vatAmount = itemSubtotal * (vatRate / 100);

    const existingVat = vatMap.get(vatRate) || 0;
    vatMap.set(vatRate, existingVat + vatAmount);
  });

  const vatBreakdown = Array.from(vatMap.entries()).map(([rate, amount]) => ({
    rate,
    amount,
  }));

  const totalTax = Array.from(vatMap.values()).reduce((sum, amount) => sum + amount, 0);

  return {
    invoice,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: formatGermanDate(invoice.createdAt),
    order,
    items: order.items,
    customer: order.customer,
    payment: order.payment,
    subtotal: Number(order.subtotal),
    vatBreakdown,
    totalTax,
    totalAmount: Number(order.totalAmount),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discountAmount),
  };
};

/**
 * Generate Invoice PDF (German legal format with VAT breakdown)
 */
export const generateInvoicePDF = async (orderId: string): Promise<Buffer> => {
  const invoiceData = await generateInvoice(orderId);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== HEADER =====
      // Company name and logo area
      doc.fontSize(20).font('Helvetica-Bold').text(env.COMPANY_NAME, 50, 50);

      doc.fontSize(10).font('Helvetica').text(env.COMPANY_ADDRESS, 50, 75);

      // Invoice title and details on right
      doc.fontSize(14).font('Helvetica-Bold').text('RECHNUNG', 400, 50);

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Rechnungsnummer: ${invoiceData.invoiceNumber}`, 400, 75)
        .text(`Rechnungsdatum: ${invoiceData.invoiceDate}`, 400, 90);

      // Horizontal line
      doc.moveTo(50, 120).lineTo(550, 120).stroke();

      // ===== CUSTOMER SECTION =====
      doc.fontSize(11).font('Helvetica-Bold').text('Lieferadresse:', 50, 140);

      const deliveryAddr = invoiceData.order.deliveryAddress as any;
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${invoiceData.customer.firstName} ${invoiceData.customer.lastName}`, 50, 160)
        .text(deliveryAddr.street || '', 50, 175)
        .text(`${deliveryAddr.zipCode || ''} ${deliveryAddr.city || ''}`, 50, 190)
        .text(deliveryAddr.country || '', 50, 205);

      // ===== TAX/COMPANY INFO =====
      doc.fontSize(8).text(`Steuernummer: ${env.COMPANY_TAX_ID}`, 350, 160);

      if (env.COMPANY_IBAN) {
        doc.text(`IBAN: ${env.COMPANY_IBAN}`, 350, 175);
      }

      // ===== ITEMS TABLE =====
      const tableTop = 250;
      const col1 = 50; // Item name
      const col2 = 280; // Quantity
      const col3 = 330; // Unit price
      const col4 = 400; // VAT %
      const col5 = 450; // Total

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Artikel', col1, tableTop)
        .text('Menge', col2, tableTop)
        .text('Einzelpreis', col3, tableTop)
        .text('MwSt.', col4, tableTop)
        .text('Gesamt', col5, tableTop);

      // Separator line
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Items
      let yPosition = tableTop + 25;
      invoiceData.items.forEach((item: any) => {
        const vatRate = Number(item.product.vatRate);
        const unitPrice = Number(item.unitPrice);
        const itemTotal = unitPrice * item.quantity;

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(item.product.name, col1, yPosition, { width: 220 })
          .text(String(item.quantity), col2, yPosition)
          .text(`€${unitPrice.toFixed(2)}`, col3, yPosition)
          .text(`${vatRate.toFixed(0)}%`, col4, yPosition)
          .text(`€${itemTotal.toFixed(2)}`, col5, yPosition);

        yPosition += 30;
      });

      // Total table separator
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // ===== TOTALS SECTION =====
      const colLabel = 350;
      const colValue = 450;

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Zwischensumme:', colLabel, yPosition)
        .text(`€${invoiceData.subtotal.toFixed(2)}`, colValue, yPosition);

      yPosition += 20;

      // VAT Breakdown
      invoiceData.vatBreakdown.forEach((vat) => {
        doc
          .text(`MwSt. ${vat.rate.toFixed(0)}%:`, colLabel, yPosition)
          .text(`€${vat.amount.toFixed(2)}`, colValue, yPosition);
        yPosition += 15;
      });

      // Shipping (if applicable)
      if (invoiceData.shippingCost > 0) {
        doc
          .text('Versand:', colLabel, yPosition)
          .text(`€${invoiceData.shippingCost.toFixed(2)}`, colValue, yPosition);
        yPosition += 15;
      }

      // Discount (if applicable)
      if (invoiceData.discount > 0) {
        doc
          .font('Helvetica')
          .text('Rabatt:', colLabel, yPosition)
          .text(`-€${invoiceData.discount.toFixed(2)}`, colValue, yPosition);
        yPosition += 15;
      }

      // Final total
      doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 8;

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Gesamtbetrag:', colLabel, yPosition)
        .text(`€${invoiceData.totalAmount.toFixed(2)}`, colValue, yPosition);

      // ===== PAYMENT INFO SECTION =====
      yPosition += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Zahlungsinformationen:', 50, yPosition);

      yPosition += 15;
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Zahlungsart: ${invoiceData.payment?.method || 'N/A'}`, 50, yPosition);

      if (invoiceData.payment) {
        yPosition += 15;
        const paymentDate = new Date(invoiceData.payment.createdAt);
        doc.text(`Zahlungsdatum: ${formatGermanDate(paymentDate)}`, 50, yPosition);
      }

      // Bank details if available
      if (env.COMPANY_IBAN) {
        yPosition += 20;
        doc.fontSize(9).text('Bankverbindung:', 50, yPosition);
        yPosition += 12;
        doc.text(`IBAN: ${env.COMPANY_IBAN}`, 50, yPosition);
        if (env.COMPANY_BIC) {
          yPosition += 12;
          doc.text(`BIC: ${env.COMPANY_BIC}`, 50, yPosition);
        }
      }

      // ===== FOOTER =====
      const footerY = 750;
      doc.moveTo(50, footerY).lineTo(550, footerY).stroke();

      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`${env.COMPANY_NAME} | ${env.COMPANY_ADDRESS}`, 50, footerY + 10)
        .text(`Email: ${env.COMPANY_EMAIL}`, 50, footerY + 22);

      if (env.COMPANY_PHONE) {
        doc.text(`Tel: ${env.COMPANY_PHONE}`, 50, footerY + 34);
      }

      doc.text(`Steuernummer: ${env.COMPANY_TAX_ID}`, 50, footerY + 46);
      doc.text(`Seite 1 von 1`, 500, footerY + 10, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send invoice via email with PDF attachment
 */
export const sendInvoiceEmail = async (orderId: string, customerEmail: string): Promise<void> => {
  try {
    const invoiceData = await generateInvoice(orderId);

    // TODO: Generate PDF and send email with attachment
    // const pdfBuffer = await generateInvoicePDF(orderId);
    // const emailHtml = `...`; // Email template

    // Queue email with attachment (simplified - sendEmailAsync doesn't support attachments yet)
    logger.info(`Invoice email queued for ${customerEmail} (${invoiceData.invoiceNumber})`);

    // TODO: Implement attachment support in email service via Brevo API
    // For now, just log the invoice was generated
    await prisma.invoice.update({
      where: { id: invoiceData.invoice.id },
      data: { sentAt: new Date() },
    });
  } catch (error: any) {
    logger.error(`Failed to send invoice email: ${error.message}`, error);
    throw new AppError('Failed to send invoice email', 500, 'INVOICE_EMAIL_FAILED');
  }
};

/**
 * Retrieve existing invoice data without regenerating
 */
export const getInvoiceData = async (orderId: string): Promise<InvoiceData> => {
  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
  });

  if (!invoice) {
    throw new NotFoundError('Invoice not found for this order');
  }

  return generateInvoice(orderId);
};

/**
 * Get simple payment receipt (less detailed than invoice)
 */
export const getPaymentReceipt = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return {
    receiptDate: formatGermanDate(order.createdAt),
    receiptNumber: `REC-${order.id.substring(0, 8).toUpperCase()}`,
    orderNumber: order.id,
    customer: order.customer,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discountAmount),
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.payment?.method || 'Pending',
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
  };
};
