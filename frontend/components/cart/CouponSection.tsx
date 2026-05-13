"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { formatPrice } from "@/lib/cart/cartUtils";

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CouponSectionProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApply: (couponCode: string) => Promise<void>;
  onRemove: () => void;
  isLoading?: boolean;
}

export const CouponSection = ({
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
  isLoading = false,
}: CouponSectionProps) => {
  const { language } = useLanguage();
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApply = async () => {
    setError("");
    setSuccess("");

    if (!couponCode.trim()) {
      setError("Bitte Gutscheincode eingeben");
      return;
    }

    try {
      await onApply(couponCode);
      setSuccess(`Gutschein "${couponCode}" angewendet!`);
      setCouponCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gutschein ungültig");
    }
  };

  const handleRemove = () => {
    onRemove();
    setCouponCode("");
    setError("");
    setSuccess("");
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">
              {t("cart.appliedCoupon", language)}: {appliedCoupon.code}
            </p>
            <p className="text-lg font-bold text-green-900 mt-1">
              -{formatPrice(appliedCoupon.discount)}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-200 rounded transition-colors">
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === "Enter" && handleApply()}
          placeholder="Gutscheincode"
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-maroon transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="px-6 py-2 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isLoading ? "..." : t("cart.couponApply", language)}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-sm mt-2 font-medium">{success}</p>
      )}
    </div>
  );
};
