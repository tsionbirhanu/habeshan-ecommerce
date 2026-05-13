"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCartStore } from "@/lib/stores/cart.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  useCheckoutStore,
  ShippingRate,
  Address,
} from "@/lib/stores/checkout.store";
import { usersAPI } from "@/lib/api/users.api";
import {
  CheckoutProgress,
  DeliveryStep,
  ShippingStep,
  PaymentStep,
  ConfirmationStep,
} from "@/components/checkout";

// Step definitions
const STEPS = [
  { number: 1, label: "Lieferung", emoji: "📦" },
  { number: 2, label: "Versandart", emoji: "🚚" },
  { number: 3, label: "Zahlung", emoji: "💳" },
  { number: 4, label: "Bestätigung", emoji: "✅" },
];

// Mock shipping rates (normally from API)
const MOCK_SHIPPING_RATES: ShippingRate[] = [
  {
    id: "dhl-standard",
    carrier: "DHL",
    method: "DHL Standard",
    estimatedDays: 3,
    price: 5.99,
  },
  {
    id: "hermes-express",
    carrier: "HERMES",
    method: "Hermes Express",
    estimatedDays: 1,
    price: 12.99,
  },
  {
    id: "dpd-economy",
    carrier: "DPD",
    method: "DPD Economy",
    estimatedDays: 5,
    price: 3.99,
  },
  {
    id: "free-shipping",
    carrier: "DHL",
    method: "DHL Standard (FREE)",
    estimatedDays: 3,
    price: 0,
  },
];

export default function CheckoutPage() {
  const { language } = useLanguage();
  const router = useRouter();

  // Stores
  const cartStore = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const checkoutStore = useCheckoutStore();

  // Local states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Load saved addresses function
  const loadSavedAddresses = useCallback(async () => {
    try {
      const response = await usersAPI.getAddresses();
      if (response.data) {
        setSavedAddresses(response.data);
      }
    } catch (_err) {
      console.error("Failed to load addresses:", _err);
      // Continue gracefully
    }
  }, []);

  // Load saved addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        await loadSavedAddresses();
      })();
    }
  }, [isAuthenticated, loadSavedAddresses]);

  // Validate cart is not empty
  useEffect(() => {
    if (cartStore.items.length === 0) {
      router.push("/shop");
    }
  }, [cartStore.items.length, router]);

  // Handle step navigation
  const handleNextStep = async () => {
    if (checkoutStore.currentStep < 4) {
      // Step 1 to 2: Load shipping rates
      if (checkoutStore.currentStep === 1) {
        setIsLoading(true);
        try {
          // In a real app, you'd call:
          // const response = await shippingAPI.getShippingRates({
          //   weightKg: calculateWeight(),
          //   postalCode: checkoutStore.deliveryAddress?.postalCode,
          //   orderTotal: cartStore.total,
          // });

          // For now, mock it
          await new Promise((resolve) => setTimeout(resolve, 800));
          setError(null);
        } catch (shippingErr) {
          console.error("Shipping error:", shippingErr);
          setError("Fehler beim Laden der Versandoptionen");
          setIsLoading(false);
          return;
        } finally {
          setIsLoading(false);
        }
      }

      // Step 2 to 3: Validate shipping
      if (checkoutStore.currentStep === 2) {
        if (!checkoutStore.shippingMethod) {
          setError("Bitte wähle eine Versandart");
          return;
        }
      }

      // Step 3 to 4: Create order and payment
      if (checkoutStore.currentStep === 3) {
        await handleCreateOrderAndPayment();
        return;
      }

      checkoutStore.setCurrentStep(checkoutStore.currentStep + 1);
    }
  };

  const handleBackStep = () => {
    if (checkoutStore.currentStep > 1) {
      checkoutStore.setCurrentStep(checkoutStore.currentStep - 1);
      setError(null);
    }
  };

  const handleCreateOrderAndPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate order creation
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // In a real app, you'd call:
      // const orderResponse = await ordersAPI.createOrder({
      //   deliveryAddressId: checkoutStore.deliveryAddress?.id,
      //   billingAddressId: checkoutStore.billingAddress?.id,
      //   shippingMethod: checkoutStore.shippingMethod?.id,
      //   couponCode: checkoutStore.couponCode,
      // });
      // const orderId = orderResponse.data.id;

      // Then create payment intent based on method
      // if (checkoutStore.paymentMethod === "stripe") {
      //   await paymentsAPI.createStripeIntent({
      //     orderId,
      //     amount: cartStore.total,
      //   });
      // }

      // Mock success
      const mockOrderNumber = `#HMM-2026-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
      setOrderNumber(mockOrderNumber);
      checkoutStore.setOrderId(mockOrderNumber);
      checkoutStore.setCurrentStep(4);
      setSuccess(true);

      // Clear cart after successful order
      cartStore.clearCart();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fehler bei der Bestellaufgabe. Bitte versuche es erneut.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = () => {
    setSuccess(false);
    setError(null);
    checkoutStore.setCurrentStep(3);
  };

  const handleContinueShopping = () => {
    router.push("/shop");
    checkoutStore.reset();
  };

  // Calculate order total with shipping
  const shippingCost = checkoutStore.shippingMethod?.price || 0;
  const orderTotal = cartStore.total + shippingCost;

  // Render confirmation if order was successful
  if (checkoutStore.currentStep === 4 && success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CheckoutProgress
            currentStep={checkoutStore.currentStep}
            steps={STEPS}
          />
        </div>
        <ConfirmationStep
          success={true}
          orderNumber={orderNumber || undefined}
          email={user?.email || checkoutStore.guestEmail}
          onContinueShopping={handleContinueShopping}
        />
      </div>
    );
  }

  // Render confirmation if order failed
  if (checkoutStore.currentStep === 4 && error && !success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <CheckoutProgress
            currentStep={checkoutStore.currentStep}
            steps={STEPS}
          />
        </div>
        <ConfirmationStep
          success={false}
          error={error}
          onRetry={handleRetryPayment}
          onContinueShopping={handleContinueShopping}
        />
      </div>
    );
  }

  // Get step labels based on language
  const getSteps = () => [
    {
      number: 1,
      label: language === "de" ? "Lieferung" : "Delivery",
      emoji: "📦",
    },
    {
      number: 2,
      label: language === "de" ? "Versandart" : "Shipping",
      emoji: "🚚",
    },
    {
      number: 3,
      label: language === "de" ? "Zahlung" : "Payment",
      emoji: "💳",
    },
    {
      number: 4,
      label: language === "de" ? "Bestätigung" : "Confirmation",
      emoji: "✅",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-12">
        <CheckoutProgress
          currentStep={checkoutStore.currentStep}
          steps={getSteps()}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Checkout Content */}
        <div className="lg:col-span-2">
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {language === "de"
                    ? "Ein Fehler ist aufgetreten"
                    : "An error occurred"}
                </p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Delivery */}
          {checkoutStore.currentStep === 1 && (
            <DeliveryStep
              onNext={handleNextStep}
              onBack={handleBackStep}
              savedAddresses={savedAddresses}
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Shipping */}
          {checkoutStore.currentStep === 2 && (
            <ShippingStep
              onNext={handleNextStep}
              onBack={handleBackStep}
              shippingRates={MOCK_SHIPPING_RATES}
              isLoading={isLoading}
            />
          )}

          {/* Step 3: Payment */}
          {checkoutStore.currentStep === 3 && (
            <PaymentStep
              onNext={handleNextStep}
              onBack={handleBackStep}
              orderTotal={orderTotal}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold text-maroon mb-6">
              📋 {t("checkout.orderSummary", language)}
            </h3>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
              {cartStore.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {language === "de" ? "Zwischensumme" : "Subtotal"}
                </span>
                <span className="font-semibold">
                  €{cartStore.subtotal.toFixed(2)}
                </span>
              </div>

              {cartStore.appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {language === "de" ? "Rabatt" : "Discount"} (
                    {cartStore.appliedCoupon.code})
                  </span>
                  <span className="font-semibold text-green-600">
                    -€{cartStore.appliedCoupon.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {checkoutStore.shippingMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {t("checkout.shipping", language)} (
                    {checkoutStore.shippingMethod.method})
                  </span>
                  <span className="font-semibold">
                    {checkoutStore.shippingMethod.price === 0 ? (
                      <span className="text-green-600">
                        {t("checkout.free", language)}
                      </span>
                    ) : (
                      `€${checkoutStore.shippingMethod.price.toFixed(2)}`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mb-6 pb-6 border-b border-gray-200 flex justify-between items-end">
              <span className="font-bold text-gray-800">
                {t("checkout.total", language)}
              </span>
              <span className="text-3xl font-bold text-maroon">
                €{orderTotal.toFixed(2)}
              </span>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>
                  {language === "de" ? "SSL-verschützt" : "SSL Secure"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>
                  {language === "de"
                    ? "Authentische Produkte"
                    : "Authentic Products"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>
                  {language === "de" ? "Schnelle Lieferung" : "Fast Shipping"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Cart Message */}
      {cartStore.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag size={48} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("checkout.emptyCart", language)}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === "de"
              ? "Füge Produkte hinzu, um mit dem Checkout zu beginnen"
              : "Add products to start checkout"}
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors font-semibold">
            {language === "de" ? "Zum Shop" : "To Shop"}
          </button>
        </div>
      )}
    </div>
  );
}
