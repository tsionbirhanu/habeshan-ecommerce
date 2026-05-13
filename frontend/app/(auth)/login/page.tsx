"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle } from "lucide-react";

// Mock login function
const mockLogin = async (email: string, password: string) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock users
  if (email === "customer@test.com" && password === "test123") {
    return {
      user: {
        id: "cust-1",
        email: "customer@test.com",
        firstName: "John",
        lastName: "Customer",
        role: "CUSTOMER" as const,
        isActive: true,
        isEmailVerified: true,
      },
      tokens: {
        accessToken: "mock-access-token-customer",
        refreshToken: "mock-refresh-token",
      },
    };
  }

  if (email === "vendor@test.com" && password === "test123") {
    return {
      user: {
        id: "vendor-1",
        email: "vendor@test.com",
        firstName: "Jane",
        lastName: "Vendor",
        role: "VENDOR" as const,
        isActive: true,
        isEmailVerified: true,
      },
      tokens: {
        accessToken: "mock-access-token-vendor",
        refreshToken: "mock-refresh-token",
      },
    };
  }

  if (email === "admin@test.com" && password === "test123") {
    return {
      user: {
        id: "admin-1",
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN" as const,
        isActive: true,
        isEmailVerified: true,
      },
      tokens: {
        accessToken: "mock-access-token-admin",
        refreshToken: "mock-refresh-token",
      },
    };
  }

  throw new Error("Invalid credentials");
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await mockLogin(email, password);

      // Save tokens and user data
      login(data.user, data.tokens.accessToken, data.tokens.refreshToken);

      // Save to localStorage
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      switch (data.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "VENDOR":
          router.push("/vendor");
          break;
        case "CUSTOMER":
        default:
          router.push("/");
          break;
      }
    } catch {
      setError(t("auth.emailOrPasswordWrong"));
    } finally {
      setIsLoading(false);
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
            placeholder="demo@example.com"
            required
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-maroon rounded focus:ring-2 focus:ring-maroon cursor-pointer"
            disabled={isLoading}
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 text-sm text-gray-600 cursor-pointer">
            {t("auth.rememberMe")}
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed mt-6">
          {isLoading ? t("auth.signing") : t("auth.signIn")}
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

      {/* Demo Credentials */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-2">Demo Credentials:</p>
        <p>Customer: customer@test.com / test123</p>
        <p>Vendor: vendor@test.com / test123</p>
        <p>Admin: admin@test.com / test123</p>
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
