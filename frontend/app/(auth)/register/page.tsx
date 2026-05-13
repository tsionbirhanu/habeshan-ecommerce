"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthHooks } from "@/lib/api/hooks/useAuth";
import { parseApiError } from "@/lib/api/errors/error-handler";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const { registerMutation } = useAuthHooks();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 3: Terms
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);

  // Step 4: Verification
  const [registrationEmail, setRegistrationEmail] = useState("");

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!firstName || !lastName || !email || !phone) {
        setError(t("auth.fillAllFields"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
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
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeToTerms) {
      setError(t("auth.agreeToTerms"));
      return;
    }

    try {
      await registerMutation.mutateAsync({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      setRegistrationEmail(email);
      setStep(4);
    } catch (err) {
      const appError = parseApiError(err);
      setError(appError.message);
    }
  };

  const handleResendEmail = () => {
    // Resend email functionality can be added here
    alert(`Verification email resent to ${registrationEmail}`);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-maroon-dark font-display mb-2">
          {t("auth.registerTitle")}
        </h1>
        {step !== 4 && (
          <p className="text-gray-600">
            {t("auth.step", { step: step.toString() })}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && step !== 4 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}>
          <div className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.firstName")}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.lastName")}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth.phone")}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 123 456789"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                required
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <Link
              href="/login"
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-center">
              {t("auth.back")}
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
              {t("auth.next")}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Password */}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}>
          <div className="space-y-4">
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
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                  required
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
                            ? getStrengthLabel(passwordStrength(password), t)
                                .color
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
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500">
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={16} /> {t("auth.passwordsMatch")}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
              {t("auth.back")}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
              {t("auth.next")}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Terms & Agreement */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-5 h-5 text-maroon rounded mt-0.5 flex-shrink-0"
                required
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {t("auth.agreeToTerms")}
                </p>
              </div>
            </label>

            {/* Newsletter Checkbox */}
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={subscribeToNewsletter}
                onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                className="w-5 h-5 text-maroon rounded mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {t("auth.subscribeNewsletter")}
                </p>
              </div>
            </label>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
              {t("auth.back")}
            </button>
            <button
              type="submit"
              disabled={registerMutation.isPending || !agreeToTerms}
              className="flex-1 px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed">
              {registerMutation.isPending
                ? t("auth.creating")
                : t("auth.createAccount")}
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Email Verification */}
      {step === 4 && (
        <div className="text-center">
          {/* Envelope Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-24 h-24 animate-bounce">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-full h-full text-maroon">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <path d="m22 4 -10 8 L 2 4"></path>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-maroon-dark mb-2 font-display">
            {t("auth.emailSent")}
          </h2>
          <p className="text-gray-600 mb-6">{t("auth.checkEmail")}</p>
          <p className="text-sm text-gray-600 mb-8">
            {t("auth.email")}:{" "}
            <strong className="text-gray-900">{registrationEmail}</strong>
          </p>

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            className="w-full px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition mb-4">
            {t("auth.resendEmail")}
          </button>

          {/* Back to Login */}
          <Link
            href="/login"
            className="block text-maroon hover:underline font-semibold text-sm">
            {t("auth.backToLogin")}
          </Link>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            {t("auth.noEmailReceived")}
          </p>
        </div>
      )}

      {/* Login Link (all steps except 4) */}
      {step !== 4 && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            {t("auth.haveAccount")}{" "}
            <Link
              href="/login"
              className="text-maroon font-semibold hover:underline">
              {t("auth.signInNow")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
