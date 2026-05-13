/**
 * Cart utility functions
 */

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 5.99;
export const TAX_RATE = 0.19; // 19% VAT for Germany

export interface ShippingInfo {
  cost: number;
  isFree: boolean;
  threshold: number;
}

export interface PriceBreakdown {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}

/**
 * Calculate shipping cost based on subtotal
 */
export const calculateShipping = (subtotal: number): ShippingInfo => {
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  return {
    cost: isFree ? 0 : SHIPPING_COST,
    isFree,
    threshold: FREE_SHIPPING_THRESHOLD,
  };
};

/**
 * Calculate tax based on subtotal
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * TAX_RATE;
};

/**
 * Calculate complete price breakdown
 */
export const calculatePriceBreakdown = (
  subtotal: number,
  discount: number = 0,
): PriceBreakdown => {
  const shippingInfo = calculateShipping(subtotal);
  const subtotalAfterDiscount = subtotal - discount;
  const tax = calculateTax(subtotalAfterDiscount);

  return {
    subtotal,
    shippingCost: shippingInfo.cost,
    tax,
    discount,
    total: subtotalAfterDiscount + tax + shippingInfo.cost,
  };
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price);
};

/**
 * Calculate free shipping progress percentage
 */
export const calculateShippingProgress = (subtotal: number): number => {
  return Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
};

/**
 * Format discount amount
 */
export const formatDiscount = (
  couponType: "percentage" | "fixed",
  value: number,
  subtotal: number,
): number => {
  if (couponType === "percentage") {
    return (subtotal * value) / 100;
  }
  return value;
};
