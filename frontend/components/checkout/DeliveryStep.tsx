"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useCheckoutStore, Address } from "@/lib/stores/checkout.store";

interface DeliveryStepProps {
  onNext: () => void;
  onBack: () => void;
  savedAddresses?: Address[];
  isLoading?: boolean;
}

export const DeliveryStep = ({
  onNext,
  onBack,
  savedAddresses = [],
  isLoading = false,
}: DeliveryStepProps) => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuthStore();
  const {
    guestEmail,
    deliveryAddress,
    billingAddress,
    useSameAddress,
    setGuestEmail,
    setDeliveryAddress,
    setBillingAddress,
    setUseSameAddress,
  } = useCheckoutStore();

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState<Address>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Germany",
  });

  const handleAddressSelect = (address: Address) => {
    setDeliveryAddress(address);
    setShowNewAddressForm(false);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSubmit = () => {
    if (
      formData.street &&
      formData.city &&
      formData.postalCode &&
      formData.country
    ) {
      setDeliveryAddress(formData);
      setShowNewAddressForm(false);
      setFormData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Germany",
      });
    }
  };

  const handleBillingAddressSubmit = () => {
    if (
      formData.street &&
      formData.city &&
      formData.postalCode &&
      formData.country
    ) {
      setBillingAddress(formData);
      setFormData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Germany",
      });
    }
  };

  const canProceed =
    (isAuthenticated || guestEmail) &&
    deliveryAddress &&
    (useSameAddress || billingAddress);

  return (
    <div className="space-y-8">
      {/* Guest Email */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <label className="block text-sm font-semibold mb-2 text-gray-800">
            {t("checkout.email", language)}
          </label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="test@example.de"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon"
          />
        </div>
      )}

      {/* Delivery Address Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-maroon mb-6">
          📦 {t("checkout.deliveryAddress", language)}
        </h3>

        {/* Saved Addresses (if logged in) */}
        {isAuthenticated && savedAddresses.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {language === "de" ? "Gespeicherte Adressen" : "Saved Addresses"}
            </p>
            <div className="grid gap-3">
              {savedAddresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => handleAddressSelect(address)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    deliveryAddress?.id === address.id
                      ? "border-maroon bg-maroon/5"
                      : "border-gray-300 hover:border-maroon/50"
                  }`}
                >
                  <p className="font-semibold text-gray-800">
                    {address.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.postalCode} {address.city}, {address.state}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Address */}
        {isAuthenticated && !showNewAddressForm && (
          <button
            onClick={() => setShowNewAddressForm(true)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors"
          >
            <Plus size={18} /> {t("checkout.addNewAddress", language)}
          </button>
        )}

        {/* New Address Form */}
        {showNewAddressForm && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg space-y-3">
            <input
              type="text"
              placeholder={t("checkout.street", language)}
              value={formData.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("checkout.postalCode", language)}
                value={formData.postalCode}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
              <input
                type="text"
                placeholder={t("checkout.city", language)}
                value={formData.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("checkout.state", language)}
                value={formData.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
              <input
                type="text"
                placeholder={t("checkout.country", language)}
                value={formData.country}
                onChange={(e) =>
                  handleAddressChange("country", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddressSubmit}
                className="flex-1 px-3 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors text-sm font-semibold"
              >
                {language === "de" ? "Speichern" : "Save"}
              </button>
              <button
                onClick={() => setShowNewAddressForm(false)}
                className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm font-semibold"
              >
                {language === "de" ? "Abbrechen" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Selected Address Display */}
        {deliveryAddress && !showNewAddressForm && (
          <div className="mb-6 bg-maroon/5 border border-maroon p-4 rounded-lg">
            <p className="text-sm text-gray-700">📦 {t("checkout.deliveryAddress", language)}:</p>
            <p className="font-semibold text-gray-800">{deliveryAddress.street}</p>
            <p className="text-sm text-gray-600">
              {deliveryAddress.postalCode} {deliveryAddress.city},{" "}
              {deliveryAddress.state}
            </p>
          </div>
        )}
      </div>

      {/* Billing Address Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={useSameAddress}
            onChange={(e) => {
              setUseSameAddress(e.target.checked);
              if (e.target.checked) {
                setBillingAddress(null);
              }
            }}
            className="w-4 h-4 accent-maroon cursor-pointer"
          />
          <label className="text-sm font-semibold text-gray-800 cursor-pointer">
            {t("checkout.sameBillingAddress", language)}
          </label>
        </div>

        {!useSameAddress && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800 mb-3">💳 {t("checkout.billingAddress", language)}</h4>
            <input
              type="text"
              placeholder={t("checkout.street", language)}
              value={formData.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("checkout.postalCode", language)}
                value={formData.postalCode}
                onChange={(e) =>
                  handleAddressChange("postalCode", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
              <input
                type="text"
                placeholder={t("checkout.city", language)}
                value={formData.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("checkout.state", language)}
                value={formData.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
              <input
                type="text"
                placeholder={t("checkout.country", language)}
                value={formData.country}
                onChange={(e) =>
                  handleAddressChange("country", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon text-sm"
              />
            </div>
            <button
              onClick={handleBillingAddressSubmit}
              className="w-full px-3 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/90 transition-colors text-sm font-semibold"
            >
              {language === "de" ? "Rechnungsadresse speichern" : "Save Billing Address"}
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border-2 border-maroon text-maroon rounded-lg hover:bg-maroon/10 transition-colors font-semibold"
        >
          {t("checkout.back", language)}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="flex-1 px-4 py-3 bg-maroon text-white rounded-lg hover:bg-maroon/90 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isLoading ? (language === "de" ? "Wird geladen..." : "Loading...") : t("checkout.next", language)}
        </button>
      </div>
    </div>
  );
};
