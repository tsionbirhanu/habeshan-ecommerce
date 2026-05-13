"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle, Mail } from "lucide-react";

// Mock forgot password function
const mockForgotPassword = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  // Always succeed for mock
  return { success: true };
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await mockForgotPassword(email);
      setIsSubmitted(true);
      setEmail("");
    } catch (err: any) {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
            {t("auth.linkSent")}
          </h1>
        </div>

        {/* Success Message */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <Mail className="w-20 h-20 text-blue-600 relative" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 mb-2">{t("auth.emailExists")}</p>
          <p className="text-sm text-gray-600">{t("auth.checkSpam")}</p>
        </div>

        {/* Back to Login */}
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className="text-gray-600">{t("auth.forgotPasswordSubtitle")}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
          {isLoading ? t("auth.sending") : t("auth.sendLink")}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          <Link
            href="/login"
            className="text-maroon font-semibold hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
