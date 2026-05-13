"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuthHooks } from "@/lib/api/hooks/useAuth";
import { parseApiError } from "@/lib/api/errors/error-handler";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const { verifyEmailMutation } = useAuthHooks();
  const { t } = useTranslation();

  const token = params.token as string;

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmailMutation.mutateAsync({ token });
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => router.push("/login"), 3000);
      } catch (err) {
        const appError = parseApiError(err);
        setError(appError.message);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verify();
    }
  }, [token, verifyEmailMutation]);

  if (verifying) {
    return (
      <div className="w-full text-center py-12">
        <div className="mb-8 flex justify-center">
          <div className="relative w-16 h-16 animate-spin">
            <Clock className="w-full h-full text-maroon" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.verifying")}
        </h1>
        <p className="text-gray-600">{t("auth.verifyingEmail")}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full text-center py-12">
        <div className="mb-8 flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.emailVerified")}
        </h1>
        <p className="text-gray-600 mb-8">
          {t("auth.emailVerificationSuccess")}
        </p>

        <p className="text-sm text-gray-500 mb-8">
          {t("auth.redirectingToLogin")}...
        </p>

        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.goToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full text-center py-12">
      <div className="mb-8 flex justify-center">
        <AlertCircle className="w-16 h-16 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
        {t("auth.verificationFailed")}
      </h1>
      <p className="text-gray-600 mb-8">{error || t("auth.unknownError")}</p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="flex-1 px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
          {t("auth.backToLogin")}
        </Link>
        <Link
          href="/forgot-password"
          className="flex-1 px-6 py-3 border-2 border-maroon text-maroon rounded-lg font-semibold hover:bg-maroon hover:text-white transition">
          {t("auth.needHelp")}
        </Link>
      </div>
    </div>
  );
}
