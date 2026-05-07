import db from '../../database/prisma';
import logger from '../../utils/logger';
import { AppError } from '../../utils/errors';

/**
 * Shipping Service
 * Handles shipping zone classification, rate calculation, and carrier selection
 */

export interface ShippingRate {
  method: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
  cost: number;
  estimatedDays: number;
  carrier: string;
}

export interface ShippingZone {
  zone: number;
  name: string;
  prefixes: string[];
}

const SHIPPING_ZONES: ShippingZone[] = [
  {
    zone: 1,
    name: 'Berlin/Brandenburg',
    prefixes: ['10', '11', '12', '13', '14', '15', '16'],
  },
  {
    zone: 2,
    name: 'North',
    prefixes: ['17', '18', '19', '20', '21', '22', '23', '24', '25'],
  },
  {
    zone: 3,
    name: 'West',
    prefixes: [
      '40',
      '41',
      '42',
      '43',
      '44',
      '45',
      '46',
      '47',
      '48',
      '49',
      '50',
      '51',
      '52',
      '53',
      '54',
      '55',
      '56',
      '57',
      '58',
      '59',
    ],
  },
  {
    zone: 4,
    name: 'South',
    prefixes: [
      '70',
      '71',
      '72',
      '73',
      '74',
      '75',
      '76',
      '77',
      '78',
      '79',
      '80',
      '81',
      '82',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
      '90',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
      '97',
      '98',
      '99',
    ],
  },
  {
    zone: 5,
    name: 'East',
    prefixes: [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
    ],
  },
];

const STANDARD_RATES = {
  base: 5.99,
  perKgOverLimit: 0.5,
  weightLimit: 2,
};

const EXPRESS_RATES = {
  base: 9.99,
  perKgOverLimit: 1.0,
  weightLimit: 2,
};

const OVERNIGHT_RATES = {
  base: 14.99,
};

const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD) || 50;

/**
 * Determine shipping zone from German postal code
 * @param postalCode German postal code (5 digits)
 * @returns Zone number (1-5)
 */
export function getShippingZone(postalCode: string): number {
  const prefix = postalCode.substring(0, 2);

  for (const zone of SHIPPING_ZONES) {
    if (zone.prefixes.includes(prefix)) {
      return zone.zone;
    }
  }

  // Default to zone 5 if not found
  return 5;
}

/**
 * Calculate shipping cost for different methods
 * @param weightKg Package weight in kg
 * @param postalCode Destination postal code
 * @param orderTotal Total order amount (for free shipping threshold)
 * @param method Optional - filter by specific method
 * @returns Array of available shipping rates
 */
export function calculateShippingCost(
  weightKg: number,
  postalCode: string,
  orderTotal: number = 0,
  method?: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT'
): ShippingRate[] {
  // Check for free shipping
  if (orderTotal >= FREE_SHIPPING_THRESHOLD) {
    return (
      [
        { method: 'STANDARD', cost: 0, estimatedDays: 4, carrier: 'HERMES' },
        { method: 'EXPRESS', cost: 0, estimatedDays: 1, carrier: 'DHL' },
        { method: 'OVERNIGHT', cost: 0, estimatedDays: 0, carrier: 'DHL' },
      ] as ShippingRate[]
    ).filter((rate) => !method || rate.method === method);
  }

  const zone = getShippingZone(postalCode);
  const rates: ShippingRate[] = [];

  // Standard shipping calculation
  let standardCost = STANDARD_RATES.base;
  if (weightKg > STANDARD_RATES.weightLimit) {
    standardCost += (weightKg - STANDARD_RATES.weightLimit) * STANDARD_RATES.perKgOverLimit;
  }

  if (!method || method === 'STANDARD') {
    rates.push({
      method: 'STANDARD',
      cost: Number(standardCost.toFixed(2)),
      estimatedDays: 4,
      carrier: zone <= 3 ? 'HERMES' : 'DPD',
    });
  }

  // Express shipping calculation
  let expressCost = EXPRESS_RATES.base;
  if (weightKg > EXPRESS_RATES.weightLimit) {
    expressCost += (weightKg - EXPRESS_RATES.weightLimit) * EXPRESS_RATES.perKgOverLimit;
  }

  if (!method || method === 'EXPRESS') {
    rates.push({
      method: 'EXPRESS',
      cost: Number(expressCost.toFixed(2)),
      estimatedDays: 1,
      carrier: 'DHL',
    });
  }

  // Overnight shipping (fixed price)
  if (!method || method === 'OVERNIGHT') {
    rates.push({
      method: 'OVERNIGHT',
      cost: OVERNIGHT_RATES.base,
      estimatedDays: 0,
      carrier: 'DHL',
    });
  }

  return rates;
}

/**
 * Get available carriers for a shipping method
 * @param method Shipping method
 * @returns Array of carrier names
 */
export function getAvailableCarriers(method: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT'): string[] {
  switch (method) {
    case 'EXPRESS':
    case 'OVERNIGHT':
      return ['DHL'];
    case 'STANDARD':
    default:
      return ['HERMES', 'DPD'];
  }
}

/**
 * Validate if carrier is available for method
 * @param method Shipping method
 * @param carrier Carrier name
 * @returns True if combination is valid
 */
export function isValidCarrierMethod(
  method: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT',
  carrier: string
): boolean {
  const availableCarriers = getAvailableCarriers(method);
  return availableCarriers.includes(carrier);
}

/**
 * Create shipment in database
 * @param orderId Order ID
 * @param method Shipping method
 * @param carrier Carrier name
 * @param trackingNumber Tracking number from carrier
 * @param labelUrl URL to shipping label
 * @returns Created shipment
 */
export async function createShipment(
  orderId: string,
  method: string,
  carrier: string,
  trackingNumber: string,
  labelUrl: string
) {
  try {
    const shipment = await db.shipment.create({
      data: {
        orderId,
        method: method as any,
        carrier,
        trackingNumber,
        labelUrl,
        status: 'SHIPPED',
      },
      include: {
        trackingEvents: true,
        order: {
          include: {
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Shipment created: ${shipment.id} for order ${orderId}`);
    return shipment;
  } catch (error) {
    logger.error(`Failed to create shipment for order ${orderId}:`, error);
    throw new AppError('Failed to create shipment', 500, 'SHIPMENT_CREATE_ERROR');
  }
}

/**
 * Add tracking event to shipment
 * @param shipmentId Shipment ID
 * @param status Event status
 * @param location Current location
 * @param description Event description
 * @returns Created tracking event
 */
export async function addTrackingEvent(
  shipmentId: string,
  status: string,
  location: string | null,
  description: string
) {
  try {
    const event = await db.trackingEvent.create({
      data: {
        shipmentId,
        status,
        location,
        description,
        occurredAt: new Date(),
      },
    });

    logger.info(`Tracking event added: ${event.id} for shipment ${shipmentId}`);
    return event;
  } catch (error) {
    logger.error(`Failed to add tracking event for shipment ${shipmentId}:`, error);
    throw new AppError('Failed to add tracking event', 500, 'TRACKING_EVENT_ERROR');
  }
}

/**
 * Get shipment with tracking history
 * @param shipmentId Shipment ID
 * @returns Shipment with tracking events
 */
export async function getShipmentWithTracking(shipmentId: string) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        trackingEvents: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      throw new AppError('Shipment not found', 404, 'SHIPMENT_NOT_FOUND');
    }

    return shipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Failed to fetch shipment ${shipmentId}:`, error);
    throw new AppError('Failed to fetch shipment', 500, 'SHIPMENT_FETCH_ERROR');
  }
}

/**
 * Get shipment by tracking number
 * @param trackingNumber Tracking number
 * @returns Shipment with tracking events
 */
export async function getShipmentByTrackingNumber(trackingNumber: string) {
  try {
    const shipment = await db.shipment.findFirst({
      where: { trackingNumber },
      include: {
        trackingEvents: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      throw new AppError('Tracking number not found', 404, 'TRACKING_NOT_FOUND');
    }

    return shipment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Failed to fetch shipment by tracking ${trackingNumber}:`, error);
    throw new AppError('Failed to fetch tracking information', 500, 'TRACKING_FETCH_ERROR');
  }
}

/**
 * Update order status after shipment
 * @param orderId Order ID
 * @param status New order status
 */
export async function updateOrderShipmentStatus(orderId: string, status: string) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        customer: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    logger.info(`Order ${orderId} status updated to ${status}`);
    return order;
  } catch (error) {
    logger.error(`Failed to update order ${orderId} status:`, error);
    throw new AppError('Failed to update order status', 500, 'ORDER_UPDATE_ERROR');
  }
}
