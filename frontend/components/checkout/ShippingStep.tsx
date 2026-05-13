"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCheckoutStore, ShippingRate } from "@/lib/stores/checkout.store";

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
  shippingRates: ShippingRate[];
  isLoading?: boolean;
}

const CARRIER_LOGOS: Record<string, string> = {
  DHL: "🚚 DHL",
  HERMES: "📦 Hermes",
  DPD: "🚐 DPD",
};

export const ShippingStep = ({
  onNext,
  onBack,
  shippingRates,
  isLoading = false,
}: ShippingStepProps) => {
  const { language } = useLanguage();
  const { shippingMethod, setShippingMethod } = useCheckoutStore();

  const canProceed = !!shippingMethod;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-maroon mb-2">
          🚚 {t("checkout.step2.title", language)}
        </h3>
        <p className="text-sm text-gray-600">
          {t("checkout.step2.description", language)}
        </p>
      </div>

      {/* Shipping Options */}
      <div className="grid gap-4">
        {shippingRates.map((rate) => (
          <button
            key={rate.id}
            onClick={() => setShippingMethod(rate)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              shippingMethod?.id === rate.id
                ? "border-maroon bg-maroon/5"
                : "border-gray-300 hover:border-maroon/50"
            }`}>
            <div className="flex items-start justify-between">
              {/* Carrier and Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg">{CARRIER_LOGOS[rate.carrier]}</span>
                  <h4 className="font-semibold text-gray-800">{rate.method}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  ⏱️{" "}
                  {language === "de"
                    ? `Lieferung in ca. ${rate.estimatedDays} Tagen`
                    : `Delivery in approx. ${rate.estimatedDays} days`}
                </p>
              </div>

              {/* Price */}
              <div className="flex flex-col items-end">
                <p className="font-bold text-maroon text-lg">
                  {rate.price === 0 ? (
                    <span className="text-green-600">
                      {t("checkout.free", language)}
                    </span>
                  ) : (
                    `€${rate.price.toFixed(2)}`
                  )}
                </p>
                {rate.price === 0 && (
                  <p className="text-xs text-green-600 font-semibold">
                    {t("checkout.freeShippingThreshold", language)}
                  </p>
                )}
              </div>

              {/* Radio Circle */}
              <div className="ml-4 flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    shippingMethod?.id === rate.id
                      ? "border-maroon bg-maroon"
                      : "border-gray-400"
                  }`}>
                  {shippingMethod?.id === rate.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          💡{" "}
          {language === "de"
            ? "Die Versandkosten werden bei der Zahlungsmethode berücksichtigt. Alle Preise sind inkl. MwSt."
            : "Shipping costs will be included in the payment method. All prices include VAT."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border-2 border-maroon text-maroon rounded-lg hover:bg-maroon/10 transition-colors font-semibold">
          {t("checkout.back", language)}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="flex-1 px-4 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:bg-gray-400 transition-colors font-semibold">
          {isLoading
            ? language === "de"
              ? "Wird geladen..."
              : "Loading..."
            : t("checkout.next", language)}
        </button>
      </div>
    </div>
  );
};
