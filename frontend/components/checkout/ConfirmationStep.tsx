"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCheckoutStore } from "@/lib/stores/checkout.store";
import { CreditCard, Lock } from "lucide-react";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
  orderTotal: number;
  isLoading?: boolean;
}

type PaymentTab = "stripe" | "paypal" | "klarna";

export const PaymentStep = ({
  onNext,
  onBack,
  orderTotal,
  isLoading = false,
}: PaymentStepProps) => {
  const { language } = useLanguage();
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();
  const [activeTab, setActiveTab] = useState<PaymentTab>("stripe");

  // Mock card data
  const [cardData, setCardData] = useState({
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/25",
    cardCVC: "123",
  });

  const handleTabChange = (tab: PaymentTab) => {
    setActiveTab(tab);
    setPaymentMethod(tab);
  };

  const getTabLabel = (tab: PaymentTab) => {
    if (tab === "stripe")
      return language === "de" ? "💳 Kreditkarte" : "💳 Credit Card";
    if (tab === "paypal") return language === "de" ? "🅿 PayPal" : "🅿 PayPal";
    return language === "de" ? "📦 Klarna" : "📦 Klarna";
  };

  return (
    <div className="space-y-8">
      {/* Payment Method Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          <button
            onClick={() => handleTabChange("stripe")}
            className={`flex-1 py-3 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "stripe"
                ? "border-maroon text-maroon"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            {getTabLabel("stripe")}
          </button>
          <button
            onClick={() => handleTabChange("paypal")}
            className={`flex-1 py-3 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "paypal"
                ? "border-maroon text-maroon"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            {getTabLabel("paypal")}
          </button>
          <button
            onClick={() => handleTabChange("klarna")}
            className={`flex-1 py-3 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "klarna"
                ? "border-maroon text-maroon"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}>
            {getTabLabel("klarna")}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          {/* Credit Card Tab */}
          {activeTab === "stripe" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {language === "de" ? "Kartendaten" : "Card Details"}
              </h3>

              {/* Mock Card Form (Stripe integration would go here) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("checkout.cardNumber", language)}
                </label>
                <div className="p-4 bg-gradient-to-r from-maroon to-maroon/80 text-white rounded-lg border-2 border-maroon/50">
                  <p className="text-lg font-mono tracking-wider mb-3">
                    {cardData.cardNumber}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-300">Ablauf</p>
                      <p className="font-mono">{cardData.cardExpiry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">CVC</p>
                      <p className="font-mono">***</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                💡{" "}
                {language === "de"
                  ? "Dies ist ein Mock-Test. Verwende Test-Kartennummer: 4242 4242 4242 4242"
                  : "This is a mock test. Use test card: 4242 4242 4242 4242"}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ✓{" "}
                  {language === "de"
                    ? "Strikte PCI-DSS Sicherheit"
                    : "Strict PCI-DSS Security"}
                  <br />✓{" "}
                  {language === "de"
                    ? "SSL/TLS Verschlüsselung"
                    : "SSL/TLS Encryption"}
                  <br />✓{" "}
                  {language === "de"
                    ? "3D Secure unterstützt"
                    : "3D Secure Supported"}
                </p>
              </div>
            </div>
          )}

          {/* PayPal Tab */}
          {activeTab === "paypal" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {language === "de"
                  ? "PayPal Express Checkout"
                  : "PayPal Express Checkout"}
              </h3>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 text-center">
                <p className="text-2xl mb-2">🅿️</p>
                <p className="font-bold text-lg mb-3">PayPal</p>
                <p className="text-sm mb-6">
                  {language === "de"
                    ? "Sichere Zahlung mit deinem PayPal-Konto"
                    : "Secure payment with your PayPal account"}
                </p>
                {/* Mock PayPal button */}
                <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  {language === "de" ? "Mit PayPal zahlen" : "Pay with PayPal"}
                </button>
              </div>
              <p className="text-xs text-gray-600">
                💡{" "}
                {language === "de"
                  ? "Du wirst zu PayPal weitergeleitet um die Zahlung zu bestätigen."
                  : "You will be redirected to PayPal to confirm the payment."}
              </p>
            </div>
          )}

          {/* Klarna Tab */}
          {activeTab === "klarna" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {language === "de"
                  ? "Klarna - Sofort kaufen, später zahlen"
                  : "Klarna - Buy now, pay later"}
              </h3>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-8 text-center">
                <p className="text-2xl mb-2">📦</p>
                <p className="font-bold text-lg mb-3 text-pink-700">Klarna</p>
                <div className="text-sm mb-6 text-gray-700">
                  <p className="mb-2">
                    ✓{" "}
                    {language === "de"
                      ? "In 3 flexiblen Raten zahlen, ohne Zinsen"
                      : "Pay in 3 flexible installments, no interest"}
                  </p>
                  <p>
                    ✓{" "}
                    {language === "de"
                      ? "Sofort versand, erste Rate nach Lieferung"
                      : "Immediate shipment, first payment after delivery"}
                  </p>
                </div>
                {/* Mock Klarna button */}
                <button className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition-colors">
                  {language === "de" ? "Mit Klarna zahlen" : "Pay with Klarna"}
                </button>
              </div>
              <p className="text-xs text-gray-600">
                💡{" "}
                {language === "de"
                  ? "Du wirst zu Klarna weitergeleitet um deine Zahlungsplan zu bestätigen."
                  : "You will be redirected to Klarna to confirm your payment plan."}
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h4 className="font-bold text-gray-800 mb-4">
              {t("checkout.orderSummary", language)}
            </h4>

            {/* Mock order items */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {language === "de" ? "Produkte" : "Products"}
                </span>
                <span className="font-semibold">€234,50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {t("checkout.shipping", language)}
                </span>
                <span className="font-semibold text-green-600">
                  {t("checkout.free", language)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {t("checkout.tax", language)}
                </span>
                <span className="font-semibold">€44,50</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between mb-6 pb-6 border-b border-gray-200">
              <span className="font-bold text-gray-800">
                {t("checkout.total", language)}
              </span>
              <span className="text-2xl font-bold text-maroon">
                €{orderTotal.toFixed(2)}
              </span>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-4">
              <Lock size={16} className="text-green-600" />
              <span>{t("checkout.secureBadge", language)}</span>
            </div>

            {/* Payment Logos */}
            <div className="flex justify-center gap-2 py-3 border-t border-gray-200">
              <span>💳</span>
              <span>🅿️</span>
              <span>📦</span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onNext}
              disabled={!paymentMethod || isLoading}
              className="w-full mt-4 px-4 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:bg-gray-400 transition-colors font-bold">
              {isLoading
                ? language === "de"
                  ? "Wird verarbeitet..."
                  : "Processing..."
                : `🔒 ${t("checkout.buyNow", language)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 lg:col-span-2">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border-2 border-maroon text-maroon rounded-lg hover:bg-maroon/10 transition-colors font-semibold">
          {t("checkout.back", language)}
        </button>
      </div>
    </div>
  );
};
