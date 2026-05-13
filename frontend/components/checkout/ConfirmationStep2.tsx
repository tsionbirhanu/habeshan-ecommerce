"use client";

import Link from "next/link";
import { CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

interface ConfirmationStepProps {
  success: boolean;
  orderNumber?: string;
  email?: string;
  error?: string;
  onRetry?: () => void;
  onContinueShopping?: () => void;
}

export const ConfirmationStep = ({
  success,
  orderNumber = "#HMM-2026-0042",
  email,
  error,
  onRetry,
  onContinueShopping,
}: ConfirmationStepProps) => {
  const { language } = useLanguage();

  if (!success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Error Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <AlertCircle size={80} className="text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ⚠️ {t("checkout.paymentFailed", language)}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ||
              (language === "de"
                ? "Leider konnte deine Zahlung nicht verarbeitet werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode."
                : "Unfortunately, your payment could not be processed. Please try again or choose a different payment method.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors font-semibold">
            {t("checkout.retryPayment", language)}
          </button>
          <a
            href="https://wa.me/491234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold">
            <MessageCircle size={20} />
            {t("checkout.contactSupport", language)}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      {/* Success Animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-maroon to-maroon/50 rounded-full animate-pulse" />
        <div className="relative w-24 h-24 flex items-center justify-center bg-white rounded-full">
          <CheckCircle size={80} className="text-maroon animate-bounce" />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {t("checkout.orderConfirmation", language)}
        </h2>
        <p className="text-gray-600 mb-6">
          {language === "de"
            ? "Deine Bestellung wurde erfolgreich aufgegeben."
            : "Your order has been successfully placed."}
        </p>

        {/* Order Number */}
        <div className="bg-maroon/10 border-2 border-maroon rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">
            {t("checkout.orderNumber", language)}
          </p>
          <p className="text-2xl font-bold text-maroon">{orderNumber}</p>
        </div>

        {/* Confirmation Email */}
        {email && (
          <p className="text-sm text-gray-700 mb-6">
            {language === "de"
              ? "Bestätigungsmail wurde an "
              : "Confirmation email sent to "}
            <span className="font-semibold text-maroon">{email}</span>{" "}
            {language === "de" ? "gesendet" : ""}
          </p>
        )}
      </div>

      {/* Order Details */}
      <div className="w-full max-w-md space-y-3 bg-gray-50 rounded-lg p-6">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800 mb-3">
            {language === "de" ? "Nächste Schritte:" : "Next steps:"}
          </h3>
          <div className="flex gap-3 text-sm text-gray-700">
            <span className="text-maroon font-bold">1.</span>
            <span>
              {language === "de"
                ? "Erhalte eine Bestätigungsmail mit allen Details"
                : "Receive a confirmation email with all details"}
            </span>
          </div>
          <div className="flex gap-3 text-sm text-gray-700">
            <span className="text-maroon font-bold">2.</span>
            <span>
              {language === "de"
                ? "Tracke deine Bestellung in Echtzeit"
                : "Track your order in real-time"}
            </span>
          </div>
          <div className="flex gap-3 text-sm text-gray-700">
            <span className="text-maroon font-bold">3.</span>
            <span>
              {language === "de"
                ? "Erhalte Updates über deine Lieferung"
                : "Receive updates about your delivery"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <Link
          href={`/customer/orders/${orderNumber}`}
          className="px-6 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors font-semibold text-center">
          [{t("checkout.orderTrackingButton", language)}]
        </Link>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 border-2 border-maroon text-maroon rounded-lg hover:bg-maroon/10 transition-colors font-semibold">
          [{t("checkout.continueShoppingButton", language)}]
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center gap-4 text-xs text-gray-600 pt-6 border-t border-gray-200 w-full max-w-md">
        <div className="text-center">
          <p className="text-lg">🔒</p>
          <p>{language === "de" ? "SSL-verschützt" : "SSL Secure"}</p>
        </div>
        <div className="text-center">
          <p className="text-lg">✓</p>
          <p>
            {language === "de" ? "Authentische Produkte" : "Authentic Products"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg">🚚</p>
          <p>{language === "de" ? "Schnelle Lieferung" : "Fast Shipping"}</p>
        </div>
      </div>
    </div>
  );
};
