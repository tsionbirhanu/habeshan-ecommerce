"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthHooks } from "@/lib/api/hooks/useAuth";
import { parseApiError } from "@/lib/api/errors/error-handler";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPasswordMutation } = useAuthHooks();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setSubmitted(true);
    } catch (err) {
      const appError = parseApiError(err);
      setError(appError.message);
    }
  };

  if (submitted) {
    return (
      <div className="w-full text-center">
        {/* Envelope Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24 animate-bounce">
            <Mail className="w-full h-full text-maroon" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.checkEmail")}
        </h1>
        <p className="text-gray-600 mb-6">{t("auth.passwordResetSent")}</p>
        <p className="text-sm text-gray-600 mb-8">
          {t("auth.email")}: <strong>{email}</strong>
        </p>

        <p className="text-sm text-gray-500 mb-8">
          {t("auth.resetLinkExpires")}
        </p>

        {/* Back to Login */}
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.forgotPassword")}
        </h1>
        <p className="text-gray-600">{t("auth.enterEmailForReset")}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
            required
            disabled={forgotPasswordMutation.isPending}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
          {forgotPasswordMutation.isPending
            ? t("auth.sending")
            : t("auth.sendResetLink")}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <Link
          href="/login"
          className="text-maroon hover:underline font-semibold text-sm">
          {t("auth.backToLogin")}
        </Link>
      </div>
    </div>
  );
}
