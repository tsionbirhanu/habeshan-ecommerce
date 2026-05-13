"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle, Eye, EyeOff, CheckCircle2, Store } from "lucide-react";

const passwordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  return strength;
};

const getStrengthLabel = (strength: number, t: Function) => {
  switch (strength) {
    case 0:
      return { label: t("auth.veryWeak"), color: "bg-red-500" };
    case 1:
      return { label: t("auth.weak"), color: "bg-orange-500" };
    case 2:
      return { label: t("auth.medium"), color: "bg-yellow-500" };
    case 3:
      return { label: t("auth.strong"), color: "bg-blue-500" };
    case 4:
      return { label: t("auth.veryStrong"), color: "bg-green-500" };
    default:
      return { label: "", color: "bg-gray-300" };
  }
};

// Mock vendor setup function
const mockVendorSetup = async (token: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Always succeed for mock
  return { success: true, message: "Account activated successfully" };
};

function VendorSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("auth.invalidToken"));
      return;
    }

    if (!password || !confirmPassword) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    if (passwordStrength(password) < 2) {
      setError(t("auth.passwordTooWeak"));
      return;
    }

    setIsLoading(true);

    try {
      await mockVendorSetup(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(t("auth.setupFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full text-center">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-6">
          {t("auth.invalidToken")}
        </h1>
        <p className="text-gray-600 mb-8">{t("auth.vendorSetupRequired")}</p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.registerAsVendor")}
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
            {t("auth.welcome")}
          </h1>
          <p className="text-gray-600">{t("auth.vendorAccountReady")}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
            <Store className="w-20 h-20 text-maroon relative" />
          </div>
        </div>

        <p className="text-gray-600 mb-8">{t("auth.startSellingMessage")}</p>

        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.loginNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="inline-block p-3 bg-maroon/10 rounded-full mb-4">
          <Store className="w-8 h-8 text-maroon" />
        </div>
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.activateVendorAccount")}
        </h1>
        <p className="text-gray-600">{t("auth.setPasswordMessage")}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-3">
              <div className="flex gap-2 mb-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      i < passwordStrength(password)
                        ? getStrengthLabel(passwordStrength(password), t).color
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                {t("auth.passwordStrength")}:{" "}
                {getStrengthLabel(passwordStrength(password), t).label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("auth.confirmPassword")}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-500">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {confirmPassword && password === confirmPassword && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 size={16} /> {t("auth.passwordsMatch")}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
          {isLoading ? t("auth.activating") : t("auth.activateAccount")}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="text-maroon font-semibold hover:underline">
            {t("auth.loginHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VendorSetupPage() {
  return (
    <Suspense
      fallback={<div className="w-full text-center py-12">Loading...</div>}>
      <VendorSetupContent />
    </Suspense>
  );
}
