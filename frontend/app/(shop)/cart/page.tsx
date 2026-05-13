"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCartStore } from "@/lib/stores/cart.store";
import { useUIStore } from "@/lib/stores/ui.store";
import { cartAPI } from "@/lib/api/cart.api";
import { couponsAPI } from "@/lib/api/coupons.api";
import { EmptyState } from "@/components/ui/EmptyState";
import { CartItem } from "@/components/cart/CartItem";
import { OrderSummary } from "@/components/cart/OrderSummary";
import Link from "next/link";

interface CartValidationWarning {
  unavailableCount: number;
  message: string;
}

export default function CartPage() {
  const { language } = useLanguage();
  const cartStore = useCartStore();
  const { addToast } = useUIStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [validationWarning, setValidationWarning] =
    useState<CartValidationWarning | null>(null);

  // Validate cart on page load
  useEffect(() => {
    const validateCart = async () => {
      try {
        setIsLoading(true);
        const response = await cartAPI.validateCart();
        // Handle validation response
        if (response.data && response.data.unavailableItems) {
          const unavailableCount = response.data.unavailableItems.length;
          if (unavailableCount > 0) {
            setValidationWarning({
              unavailableCount,
              message: `${unavailableCount} ${t("cart.notAvailable", language)}`,
            });
          }
        }
      } catch (error) {
        console.error("Cart validation failed:", error);
        // Continue gracefully if validation fails
      } finally {
        setIsLoading(false);
      }
    };

    validateCart();
  }, [language]);

  // Handle item removal
  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      try {
        // Optimistic update
        cartStore.removeItem(itemId);

        // API call
        await cartAPI.removeCartItem(itemId);

        addToast({
          message: "Artikel entfernt",
          type: "success",
        });
      } catch (error) {
        console.error("Failed to remove item:", error);
        addToast({
          message:
            error instanceof Error
              ? error.message
              : "Fehler beim Entfernen des Artikels",
          type: "error",
        });
        // Revalidate cart on error
        window.location.reload();
      }
    },
    [cartStore, addToast],
  );

  // Handle quantity update
  const handleQuantityChange = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        if (quantity <= 0) {
          handleRemoveItem(itemId);
          return;
        }

        // Optimistic update
        cartStore.updateQuantity(itemId, quantity);

        // API call
        await cartAPI.updateCartItem(itemId, { quantity });
      } catch (error) {
        console.error("Failed to update quantity:", error);
        addToast({
          message:
            error instanceof Error
              ? error.message
              : "Fehler beim Aktualisieren der Menge",
          type: "error",
        });
        // Revalidate cart on error
        window.location.reload();
      }
    },
    [cartStore, addToast, handleRemoveItem],
  );

  // Handle coupon application
  const handleApplyCoupon = useCallback(
    async (couponCode: string) => {
      try {
        setIsCouponLoading(true);

        // Validate coupon
        const couponResponse = await couponsAPI.validateCoupon({
          couponCode,
        });

        if (!couponResponse.data) {
          throw new Error("Ungültiger Gutschein");
        }

        const coupon = couponResponse.data;

        // Check minimum order requirement
        if (coupon.minOrder && cartStore.subtotal < coupon.minOrder) {
          throw new Error(`Mindestbestellwert: €${coupon.minOrder.toFixed(2)}`);
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === "percentage") {
          discount = (cartStore.subtotal * coupon.discount) / 100;
        } else {
          discount = coupon.discount;
        }

        // Apply coupon in store
        cartStore.applyCoupon(couponCode, discount);

        addToast({
          message: `Gutschein "${couponCode}" angewendet!`,
          type: "success",
        });
      } catch (error) {
        console.error("Coupon error:", error);
        throw error;
      } finally {
        setIsCouponLoading(false);
      }
    },
    [cartStore, addToast],
  );

  // Handle coupon removal
  const handleRemoveCoupon = useCallback(() => {
    cartStore.removeCoupon();
    addToast({
      message: "Gutschein entfernt",
      type: "info",
    });
  }, [cartStore, addToast]);

  // Empty cart state
  if (!isLoading && cartStore.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={<ShoppingBag size={64} />}
            title={t("cart.empty", language)}
            description="Füge Artikel hinzu, um deinen Warenkorb zu füllen"
            action={{
              label: t("cart.shopNow", language),
              onClick: () => (window.location.href = "/shop"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-maroon-dark mb-2">
            {t("cart.title", language)}
          </h1>
          <p className="text-gray-600">
            {cartStore.itemCount} {t("cart.itemCount", language)}
          </p>
        </div>

        {/* Validation Warning */}
        {validationWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚠️ {validationWarning.message}
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items (65%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    Wird geladen...
                  </div>
                ) : (
                  cartStore.items.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      productId={item.productId}
                      productName={item.productName}
                      price={item.price}
                      quantity={item.quantity}
                      image={item.image}
                      onQuantityChange={(qty) =>
                        handleQuantityChange(item.id, qty)
                      }
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  ))
                )}
              </div>

              {/* Continue Shopping Link */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <Link
                  href="/shop"
                  className="inline-flex items-center text-maroon hover:text-maroon-dark font-semibold transition-colors">
                  ← {t("cart.continueShopping", language)}
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (35%) */}
          <OrderSummary
            subtotal={cartStore.subtotal}
            appliedCoupon={cartStore.appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            isLoading={isLoading}
            isCouponLoading={isCouponLoading}
          />
        </div>
      </div>
    </div>
  );
}
