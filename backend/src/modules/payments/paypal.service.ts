import axios from 'axios';
import { env } from '../../config/environment';
import { AppError } from '../../utils/errors';

const PAYPAL_API_URL =
  env.PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Get PayPal OAuth access token
 */
export const getAccessToken = async (): Promise<string> => {
  try {
    // Return cached token if still valid
    if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
      return cachedAccessToken.token;
    }

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: env.PAYPAL_CLIENT_ID || '',
          password: env.PAYPAL_CLIENT_SECRET || '',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Cache token (expire 60 seconds before actual expiry)
    cachedAccessToken = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 60) * 1000,
    };

    return access_token;
  } catch (error: any) {
    throw new AppError(
      `PayPal authentication failed: ${error.response?.data?.message || error.message}`,
      400,
      'PAYPAL_AUTH_ERROR'
    );
  }
};

export interface PayPalOrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit_amount: {
    currency_code: string;
    value: string;
  };
}

export interface CreatePayPalOrderData {
  orderId: string;
  customerId: string;
  amount: string; // in EUR, e.g., "10.50"
  items: PayPalOrderItem[];
  customerEmail: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalOrderResult {
  paypalOrderId: string;
  approvalUrl: string;
  status: string;
}

/**
 * Create a PayPal order
 */
export const createOrder = async (data: CreatePayPalOrderData): Promise<PayPalOrderResult> => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        payer: {
          email_address: data.customerEmail,
        },
        purchase_units: [
          {
            reference_id: data.orderId,
            amount: {
              currency_code: 'EUR',
              value: data.amount,
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: data.amount,
                },
              },
            },
            items: data.items,
            description: `Order ${data.orderId} from Habeshan Mini Market`,
          },
        ],
        application_context: {
          brand_name: 'Habeshan Mini Market',
          locale: 'en-US',
          landing_page: 'BILLING',
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
          user_action: 'PAY_NOW',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { id, status, links } = response.data;

    // Find approval link
    const approvalLink = links.find((link: any) => link.rel === 'approve');

    return {
      paypalOrderId: id,
      approvalUrl: approvalLink?.href || '',
      status,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to create PayPal order: ${error.response?.data?.message || error.message}`,
      400,
      'PAYPAL_ORDER_CREATE_ERROR'
    );
  }
};

export interface CaptureOrderResult {
  captureId: string;
  status: string;
  amount: string;
}

/**
 * Capture a PayPal order after approval
 */
export const captureOrder = async (paypalOrderId: string): Promise<CaptureOrderResult> => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { purchase_units } = response.data;

    // Get capture details
    const capture = purchase_units[0].payments.captures[0];

    return {
      captureId: capture.id,
      status: capture.status,
      amount: capture.amount.value,
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to capture PayPal order: ${error.response?.data?.message || error.message}`,
      400,
      'PAYPAL_CAPTURE_ERROR'
    );
  }
};

/**
 * Refund a PayPal capture (full or partial)
 */
export const refundCapture = async (
  captureId: string,
  amount?: string,
  reason?: string
): Promise<{ refundId: string; status: string; amount: string }> => {
  try {
    const accessToken = await getAccessToken();

    const refundBody: any = {};
    if (amount) {
      refundBody.amount = {
        currency_code: 'EUR',
        value: amount,
      };
    }
    if (reason) {
      refundBody.note_to_payer = reason;
    }

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/payments/captures/${captureId}/refund`,
      refundBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { id, status, amount: refundAmount } = response.data;

    return {
      refundId: id,
      status,
      amount: refundAmount?.value || amount || '0',
    };
  } catch (error: any) {
    throw new AppError(
      `Failed to refund PayPal capture: ${error.response?.data?.message || error.message}`,
      400,
      'PAYPAL_REFUND_ERROR'
    );
  }
};

/**
 * Verify PayPal webhook signature
 */
export const verifyWebhookSignature = async (
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  transmissionSig: string,
  webhookBody: string
): Promise<boolean> => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: 'SHA256withRSA',
        transmission_sig: transmissionSig,
        webhook_body: webhookBody,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error: any) {
    throw new AppError(
      `PayPal webhook verification failed: ${error.response?.data?.message || error.message}`,
      401,
      'PAYPAL_WEBHOOK_VERIFICATION_FAILED'
    );
  }
};
