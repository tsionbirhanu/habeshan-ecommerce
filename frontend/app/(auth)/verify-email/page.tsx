"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// Mock verification function
const mockVerifyEmail = async (token: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // Always succeed for mock
  return { success: true };
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full text-center py-12">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslation();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("auth.invalidToken"));
      return;
    }

    const verifyEmail = async () => {
      try {
        await mockVerifyEmail(token);
        setStatus("success");
        setMessage(t("auth.verified"));
      } catch (err: any) {
        setStatus("error");
        setMessage(t("auth.invalidToken"));
      }
    };

    verifyEmail();
  }, [token, t]);

  const handleRequestNewLink = async () => {
    setIsResending(true);
    try {
      router.push("/login");
    } catch (err) {
      setMessage(t("auth.signInFailed"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.verifyEmail")}
        </h1>
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-16 h-16 text-maroon animate-spin mb-6" />
          <p className="text-gray-600 font-medium">{t("auth.verifying")}</p>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-green-600 relative" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">{message}</h2>
          <p className="text-gray-600 mb-8">{t("auth.accountActivated")}</p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
            {t("auth.backToLogin")}
          </Link>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
              <XCircle className="w-20 h-20 text-red-600 relative" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{message}</h2>
          <p className="text-gray-600 mb-8">{t("auth.invalidToken")}</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRequestNewLink}
              disabled={isResending}
              className="px-8 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50">
              {isResending ? t("auth.sending") : t("auth.requestNewLink")}
            </button>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
              {t("auth.backToLogin")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

