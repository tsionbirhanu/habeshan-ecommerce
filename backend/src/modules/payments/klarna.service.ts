import axios from 'axios';
import { env } from '../../config/environment';
import { AppError } from '../../utils/errors';

const KLARNA_API_URL =
  env.KLARNA_MODE === 'production' ? 'https://api.klarna.com' : 'https://api.playground.klarna.com';

export interface KlarnaCartItem {
  name: string;
  quantity: number;
  unit_price: number; // in cents
  tax_rate: number; // in basis points (e.g., 1900 = 19%)
  total_price_including_tax: number;
  total_price_excluding_tax: number;
  total_tax_amount: number;
}

export interface CreateSessionData {
  orderId: string;
  customerId: string;
  amount: number; // in EUR
  items: KlarnaCartItem[];
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  redirectUrl: string;
}

export interface SessionResult {
  sessionId: string;
  clientToken: string;
  redirectUrl: string;
}

/**
 * Create a Klarna checkout session
 */
export const createSession = async (data: CreateSessionData): Promise<SessionResult> => {
  try {
    // Amount in cents
    const amountInCents = Math.round(data.amount * 100);

    const response = await axios.post(
      `${KLARNA_API_URL}/checkout/v3/sessions`,
      {
        purchase_country: 'DE', // Adjustable for multi-country
        purchase_currency: 'EUR',
        locale: 'en-DE',
        order_amount: amountInCents,
        order_lines: data.items.map((item) => ({
          type: 'physical',
          reference: item.name,
          name: item.name,
          quantity: item.quantity,
          quantity_unit: 'pcs',
          unit_price: Math.round(
            (item.unit_price / data.items.reduce((sum, i) => sum + i.quantity, 0)) * 100
          ),
          tax_rate: item.tax_rate,
          total_amount: item.total_price_including_tax * 100,
          total_tax_amount: item.total_tax_amount * 100,
        })),
        merchant_reference1: data.orderId,
        customer: {
          email_address: data.customerEmail,
          given_name: data.customerFirstName,
          family_name: data.customerLastName,
        },
        billing_address: {
          given_name: data.customerFirstName,
          family_name: data.customerLastName,
          email: data.customerEmail,
          country: 'DE',
        },
        shipping_address: {
          given_name: data.customerFirstName,
          family_name: data.customerLastName,
          email: data.customerEmail,
          country: 'DE',
        },
      },
      {
        auth: {
          username: env.KLARNA_API_KEY || '',
          password: env.KLARNA_API_KEY || '', // Klarna uses API key for both username and password
        },
      }
    );

    const { session_id, client_token } = response.data;

    return {
      sessionId: session_id,
      clientToken: client_token,
      redirectUrl: `${data.redirectUrl}?session_id=${session_id}`,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to create Klarna session: ${error.response?.data?.error_messages?.[0] || error.message}`,
      400,
      'KLARNA_SESSION_CREATE_ERROR'
    );
  }
};

/**
 * Confirm a Klarna order after customer authorization
 */
export const confirmOrder = async (
  sessionId: string
): Promise<{ klarnaOrderId: string; status: string }> => {
  try {
    const response = await axios.post(
      `${KLARNA_API_URL}/checkout/v3/sessions/${sessionId}/order`,
      {},
      {
        auth: {
          username: env.KLARNA_API_KEY || '',
          password: env.KLARNA_API_KEY || '',
        },
      }
    );

    return {
      klarnaOrderId: response.data.order_id,
      status: response.data.status,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to confirm Klarna order: ${error.response?.data?.error_messages?.[0] || error.message}`,
      400,
      'KLARNA_ORDER_CONFIRM_ERROR'
    );
  }
};

/**
 * Get Klarna session details
 */
export const getSession = async (sessionId: string): Promise<{ status: string; data: any }> => {
  try {
    const response = await axios.get(`${KLARNA_API_URL}/checkout/v3/sessions/${sessionId}`, {
      auth: {
        username: env.KLARNA_API_KEY || '',
        password: env.KLARNA_API_KEY || '',
      },
    });

    return {
      status: response.data.status,
      data: response.data,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to fetch Klarna session: ${error.response?.data?.error_messages?.[0] || error.message}`,
      400,
      'KLARNA_SESSION_FETCH_ERROR'
    );
  }
};

/**
 * Refund a Klarna order (full or partial)
 */
export const refundOrder = async (
  klarnaOrderId: string,
  amount?: number
): Promise<{ refundId: string; status: string }> => {
  try {
    // Amount in cents if provided
    const refundAmount = amount ? Math.round(amount * 100) : undefined;

    const response = await axios.post(
      `${KLARNA_API_URL}/ordermanagement/v1/orders/${klarnaOrderId}/refunds`,
      {
        refunded_amount: refundAmount,
      },
      {
        auth: {
          username: env.KLARNA_API_KEY || '',
          password: env.KLARNA_API_KEY || '',
        },
      }
    );

    return {
      refundId: response.data.refund_id,
      status: response.data.status,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to refund Klarna order: ${error.response?.data?.error_messages?.[0] || error.message}`,
      400,
      'KLARNA_REFUND_ERROR'
    );
  }
};

/**
 * Verify Klarna webhook
 * Note: Klarna uses HMAC-SHA256 signature
 */
export const verifyWebhookSignature = (
  signature: string,
  body: string,
  apiKey: string
): boolean => {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto.createHmac('sha256', apiKey).update(body).digest('base64');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
};
