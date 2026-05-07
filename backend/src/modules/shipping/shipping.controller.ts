import { Request, Response, NextFunction } from 'express';
import * as shippingService from './shipping.service';
import * as dhlService from './dhl.service';
import * as hermesService from './hermes.service';
import * as dpdService from './dpd.service';
import db from '../../database/prisma';
import logger from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { AuthPayload } from '../../types/auth.types';

interface AuthRequest extends Request {
  user?: AuthPayload | null;
}

/**
 * Get available shipping rates
 * POST /api/shipping/rates
 * Public endpoint
 */
export async function getShippingRates(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { weightKg, postalCode, orderTotal } = req.body;

    if (!weightKg || !postalCode) {
      throw new AppError('weightKg and postalCode are required', 400, 'INVALID_SHIPPING_PARAMS');
    }

    if (!/^\d{5}$/.test(postalCode)) {
      throw new AppError('Invalid German postal code format', 400, 'INVALID_POSTAL_CODE');
    }

    const rates = shippingService.calculateShippingCost(weightKg, postalCode, orderTotal || 0);

    res.status(200).json({
      success: true,
      data: {
        rates,
        freeShippingThreshold: 50,
        qualifiesForFreeShipping: (orderTotal || 0) >= 50,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create shipment for an order
 * POST /api/shipping
 * Protected - ADMIN only
 */
export async function createShipment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Only admins can create shipments', 403, 'FORBIDDEN');
    }

    const { orderId } = req.params;
    const { method } = req.body;

    if (!method) {
      throw new AppError('Shipping method is required', 400, 'MISSING_METHOD');
    }

    // Validate method
    if (!['DHL', 'HERMES', 'DPD'].includes(method)) {
      throw new AppError('Invalid shipping method', 400, 'INVALID_METHOD');
    }

    // Fetch order with customer and items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      throw new AppError('Order is already shipped', 400, 'ORDER_ALREADY_SHIPPED');
    }

    // Check if shipment already exists
    const existingShipment = await db.shipment.findUnique({
      where: { orderId },
    });

    if (existingShipment) {
      throw new AppError('Shipment already exists for this order', 400, 'SHIPMENT_EXISTS');
    }

    // Get delivery address from order (stored as JSON)
    const deliveryAddr = (order.deliveryAddress as any) || {};

    const address = {
      name: `${order.customer.firstName} ${order.customer.lastName}`,
      street: deliveryAddr.street || '',
      city: deliveryAddr.city || '',
      postalCode: deliveryAddr.postalCode || '',
      country: deliveryAddr.country || 'DE',
      email: order.customer.email,
      phone: order.customer.phone || undefined,
    };

    let shipmentResponse;

    // Create shipment with selected carrier
    switch (method) {
      case 'DHL':
        shipmentResponse = await dhlService.createShipment(order, address);
        break;
      case 'HERMES':
        shipmentResponse = await hermesService.createShipment(order, address);
        break;
      case 'DPD':
        shipmentResponse = await dpdService.createShipment(order, address);
        break;
      default:
        throw new AppError('Unsupported shipping method', 400, 'UNSUPPORTED_METHOD');
    }

    // Create shipment record in database
    const shipment = await shippingService.createShipment(
      orderId,
      method,
      shipmentResponse.carrier,
      shipmentResponse.trackingNumber,
      shipmentResponse.labelUrl
    );

    // Add initial tracking event
    await shippingService.addTrackingEvent(
      shipment.id,
      'SHIPPED',
      'Shipping facility',
      'Shipment has been picked up and is in transit'
    );

    // Update order status
    await shippingService.updateOrderShipmentStatus(orderId, 'SHIPPED');

    // TODO: Queue shipment notification email
    // await emailService.sendShipmentNotification({
    //   email: order.customer.email,
    //   firstName: order.customer.firstName,
    //   trackingNumber: shipmentResponse.trackingNumber,
    //   carrier: method,
    //   estimatedDelivery: shipmentResponse.estimatedDelivery
    // });

    logger.info(`Shipment created for order ${orderId} with ${method}`);

    res.status(201).json({
      success: true,
      data: {
        shipmentId: shipment.id,
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        method: shipment.method,
        status: shipment.status,
        labelUrl: shipment.labelUrl,
        estimatedDelivery: shipmentResponse.estimatedDelivery,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get tracking information
 * GET /api/shipping/track/:trackingNumber
 * Protected - Customer or Admin
 */
export async function getTracking(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      throw new AppError('Tracking number is required', 400, 'MISSING_TRACKING');
    }

    // Fetch shipment from database
    const shipment = await shippingService.getShipmentByTrackingNumber(trackingNumber);

    // Verify user has access (own order or admin)
    if (req.user?.role !== 'ADMIN') {
      const order = await db.order.findUnique({
        where: { id: shipment.orderId },
      });

      if (order?.customerId !== req.user?.userId) {
        throw new AppError('Unauthorized to view this shipment', 403, 'FORBIDDEN');
      }
    }

    // Fetch live tracking from carrier
    let carrierTracking;
    switch (shipment.carrier) {
      case 'DHL':
        carrierTracking = await dhlService.getTracking(trackingNumber);
        break;
      case 'HERMES':
        carrierTracking = await hermesService.getTracking(trackingNumber);
        break;
      case 'DPD':
        carrierTracking = await dpdService.getTracking(trackingNumber);
        break;
      default:
        carrierTracking = { status: shipment.status, events: [] };
    }

    res.status(200).json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        method: shipment.method,
        status: carrierTracking.status,
        estimatedDelivery: shipment.estimatedDelivery,
        events: carrierTracking.events.map((event: any) => ({
          status: event.status,
          location: event.location,
          timestamp: event.timestamp,
          description: event.description,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Download shipping label
 * GET /api/shipping/:shipmentId/label
 * Protected - ADMIN only
 */
export async function downloadLabel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError('Only admins can download labels', 403, 'FORBIDDEN');
    }

    const { shipmentId } = req.params;

    const shipment = await shippingService.getShipmentWithTracking(shipmentId);

    if (!shipment.trackingNumber) {
      throw new AppError('No tracking number for this shipment', 400, 'NO_TRACKING');
    }

    // Fetch label from carrier
    let labelBuffer;
    switch (shipment.carrier) {
      case 'DHL':
        labelBuffer = await dhlService.getLabel(shipment.trackingNumber);
        break;
      case 'HERMES':
        labelBuffer = await hermesService.getLabel(shipment.trackingNumber);
        break;
      case 'DPD':
        labelBuffer = await dpdService.getLabel(shipment.trackingNumber);
        break;
      default:
        throw new AppError('Unsupported carrier', 400, 'UNSUPPORTED_CARRIER');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="label-${shipment.trackingNumber}.pdf"`
    );
    res.send(labelBuffer);

    logger.info(`Label downloaded for shipment ${shipmentId}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Get shipment details for an order
 * GET /api/shipping/:orderId
 * Protected - Customer or Admin
 */
export async function getOrderShipment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { orderId } = req.params;

    // Verify user has access (own order or admin)
    if (req.user?.role !== 'ADMIN') {
      const order = await db.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
      }

      if (order.customerId !== req.user?.userId) {
        throw new AppError('Unauthorized to view this order', 403, 'FORBIDDEN');
      }
    }

    const shipment = await db.shipment.findUnique({
      where: { orderId },
      include: {
        trackingEvents: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      res.status(200).json({
        success: true,
        data: null,
        message: 'No shipment created for this order yet',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        shipmentId: shipment.id,
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        method: shipment.method,
        status: shipment.status,
        labelUrl: shipment.labelUrl,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery,
        trackingEvents: shipment.trackingEvents,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
