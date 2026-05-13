import React, { useState } from "react";
import { Button } from "./branded-button";

interface Step {
  label: string;
  content: React.ReactNode;
  onNext?: () => boolean; // return true if validation passes
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    const canProceed = steps[currentStep].onNext?.() ?? true;
    if (canProceed && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div
              className={`
                w-12 h-12 rounded-full font-bold flex items-center justify-center
                transition-all duration-200
                ${
                  idx <= currentStep
                    ? "bg-maroon text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}>
              {idx + 1}
            </div>
            <p className="text-sm mt-2 text-center">{step.label}</p>
            {idx < steps.length - 1 && (
              <div
                className={`
                  h-1 w-full mt-4 rounded-full
                  ${idx < currentStep ? "bg-maroon" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-8 animate-fade-in-up">
        {steps[currentStep].content}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          fullWidth={currentStep === steps.length - 1}>
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};
