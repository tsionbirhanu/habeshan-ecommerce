"use client";

import React, { useState } from "react";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCartStore } from "@/lib/stores/cart.store";
import { useUIStore } from "@/lib/stores/ui.store";
import Link from "next/link";

export function CartDrawer() {
  const { language } = useLanguage();
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isDrawerOpen,
    closeDrawer,
  } = useCartStore();

  const addToast = useUIStore((state) => state.addToast);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast({
        message:
          language === "de"
            ? "Bitte geben Sie einen Gutscheincode ein"
            : "Please enter a coupon code",
        type: "warning",
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      // Simulate API call
      setTimeout(() => {
        applyCoupon(couponCode, Math.floor(subtotal * 0.1)); // 10% discount
        addToast({
          message:
            language === "de" ? "Gutschein angewendet!" : "Coupon applied!",
          type: "success",
        });
        setCouponCode("");
        setIsApplyingCoupon(false);
      }, 500);
    } catch (error) {
      addToast({
        message: language === "de" ? "Gutschein ungültig" : "Invalid coupon",
        type: "error",
      });
      setIsApplyingCoupon(false);
    }
  };

  const shippingCost = subtotal > 50 ? 0 : subtotal > 0 ? 4.99 : 0;
  const tax = (subtotal * 0.19).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeDrawer}></div>
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-maroon-dark font-display">
            {t("cart.title", language)}
          </h2>
          <button
            onClick={closeDrawer}
            className="text-gray-500 hover:text-maroon transition">
            <X size={24} />
          </button>
        </div>

        {/* Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-maroon mb-4" />
              <p className="text-gray-600 mb-4">{t("cart.empty", language)}</p>
              <button
                onClick={closeDrawer}
                className="px-6 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition">
                {t("cart.shopNow", language)}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-200">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      €{item.price.toFixed(2)}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:border-maroon transition">
                        −
                      </button>
                      <span className="px-3 text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:border-maroon transition">
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-500 hover:text-red-600 transition">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gold">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon Section */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
                <span className="text-sm font-semibold text-green-700">
                  {appliedCoupon.code}
                </span>
                <button
                  onClick={() => removeCoupon()}
                  className="text-green-600 hover:text-green-800">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t("cart.coupon", language)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-maroon"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="px-4 py-2 bg-maroon text-white rounded text-sm hover:bg-maroon-dark transition disabled:opacity-50">
                  {t("cart.couponApply", language)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Totals Section */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 space-y-4">
            {/* Free Shipping Progress */}
            {subtotal < 50 && subtotal > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{t("cart.freeShipping", language)}</span>
                  <span>€{(50 - subtotal).toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-maroon transition-all"
                    style={{ width: `${(subtotal / 50) * 100}%` }}></div>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>{t("cart.subtotal", language)}</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t("cart.shipping", language)}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `€${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t("cart.tax", language)}</span>
                <span>€{tax}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>{t("cart.discount", language)}</span>
                  <span>-€{appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-maroon-dark border-t border-gray-200 pt-2">
                <span>{t("cart.total", language)}</span>
                <span className="text-gold">€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout">
              <button className="w-full px-6 py-3 bg-maroon text-white rounded font-semibold hover:bg-maroon-dark transition flex items-center justify-center gap-2 mt-4">
                {t("cart.checkout", language)}
                <ArrowRight size={18} />
              </button>
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeDrawer}
              className="w-full px-6 py-3 bg-white border border-maroon text-maroon rounded font-semibold hover:bg-maroon hover:text-white transition">
              {t("cart.continueShopping", language)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
