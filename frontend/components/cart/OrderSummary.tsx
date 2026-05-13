"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import {
  formatPrice,
  calculatePriceBreakdown,
  calculateShippingProgress,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/cart/cartUtils";
import { CouponSection } from "./CouponSection";
import Link from "next/link";

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface OrderSummaryProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (couponCode: string) => Promise<void>;
  onRemoveCoupon: () => void;
  isLoading?: boolean;
  isCouponLoading?: boolean;
}

export const OrderSummary = ({
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading = false,
  isCouponLoading = false,
}: OrderSummaryProps) => {
  const { language } = useLanguage();

  const discount = appliedCoupon?.discount || 0;
  const priceBreakdown = calculatePriceBreakdown(subtotal, discount);
  const shippingProgress = calculateShippingProgress(subtotal);

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
        {/* Title */}
        <h2 className="text-2xl font-display font-bold text-maroon mb-6">
          {t("cart.orderSummary", language)}
        </h2>

        {/* Coupon Section */}
        <CouponSection
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
          isLoading={isCouponLoading}
        />

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t("cart.subtotal", language)}</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t("cart.estimatedShipping", language)}</span>
            {priceBreakdown.shippingCost === 0 ? (
              <span className="font-semibold text-green-600">
                {t("cart.freeShipping", language)}
              </span>
            ) : (
              <span className="font-semibold">
                {formatPrice(priceBreakdown.shippingCost)}
              </span>
            )}
          </div>

          {/* Tax */}
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t("cart.tax", language)}</span>
            <span className="font-semibold">
              {formatPrice(priceBreakdown.tax)}
            </span>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>{t("cart.discount", language)}</span>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between mb-6 pb-6 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900">
            {t("cart.total", language)}
          </span>
          <span className="text-2xl font-bold text-maroon">
            {formatPrice(priceBreakdown.total)}
          </span>
        </div>

        {/* Free Shipping Progress */}
        {!priceBreakdown.shippingCost && subtotal < FREE_SHIPPING_THRESHOLD && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-700">
                {t("cart.freeShipping", language)}
              </p>
              <p className="text-sm font-semibold text-maroon">
                {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                {t("cart.continueShopping", language)}
              </p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-maroon transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Link href="/checkout">
          <button
            disabled={isLoading}
            className="w-full py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4">
            {t("cart.checkout", language)}
          </button>
        </Link>

        {/* Payment Methods */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 font-semibold mb-3">
            {t("cart.paymentMethods", language)}
          </p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-600">Stripe</span>
            <span className="text-xs text-gray-600">PayPal</span>
            <span className="text-xs text-gray-600">Klarna</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {t("cart.securePayment", language)}
          </p>
        </div>
      </div>
    </div>
  );
};
