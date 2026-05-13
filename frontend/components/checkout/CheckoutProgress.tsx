"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

interface Step {
  number: number;
  label: string;
  emoji: string;
}

interface CheckoutProgressProps {
  currentStep: number;
  steps: Step[];
}

export const CheckoutProgress = ({
  currentStep,
  steps,
}: CheckoutProgressProps) => {
  const { language } = useLanguage();
  return (
    <div className="mb-12">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  step.number < currentStep
                    ? "bg-maroon text-white"
                    : step.number === currentStep
                      ? "border-2 border-maroon text-maroon bg-white"
                      : "bg-gray-300 text-gray-600"
                }`}>
                {step.number < currentStep ? (
                  <Check size={20} className="font-bold" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs text-center font-medium ${
                  step.number <= currentStep ? "text-maroon" : "text-gray-500"
                }`}>
                {step.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  step.number < currentStep
                    ? "bg-maroon text-white"
                    : step.number === currentStep
                      ? "border-2 border-maroon text-maroon bg-white"
                      : "bg-gray-300 text-gray-600"
                }`}>
                {step.number < currentStep ? (
                  <Check size={24} className="font-bold" />
                ) : (
                  <span className="text-xl font-bold">{step.number}</span>
                )}
                <span className="text-lg">{step.emoji}</span>
              </div>

              {/* Label */}
              <span
                className={`ml-4 font-semibold text-sm ${
                  step.number <= currentStep ? "text-maroon" : "text-gray-500"
                }`}>
                {step.label}
              </span>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 transition-all ${
                    step.number < currentStep ? "bg-maroon" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
