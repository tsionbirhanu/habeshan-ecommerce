"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthHooks } from "@/lib/api/hooks/useAuth";
import { parseApiError } from "@/lib/api/errors/error-handler";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginMutation } = useAuthHooks();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginMutation.mutateAsync({ email, password });

      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (err) {
      const appError = parseApiError(err);
      setError(appError.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.welcome")}
        </h1>
        <p className="text-gray-600">{t("auth.welcomeSubtitle")}</p>
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
            disabled={loginMutation.isPending}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t("auth.password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
            placeholder="••••••••"
            required
            disabled={loginMutation.isPending}
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
          {loginMutation.isPending ? t("auth.signing") : t("auth.signIn")}
        </button>
      </form>

      {/* Forgot Password */}
      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-maroon hover:underline font-semibold">
          {t("auth.forgotPassword")}
        </Link>
      </div>

      {/* Register Link */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          {t("auth.noAccount")}{" "}
          <Link
            href="/register"
            className="text-maroon font-semibold hover:underline">
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
