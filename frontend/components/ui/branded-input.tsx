import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      success,
      label,
      leftIcon,
      rightIcon,
      hint,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg font-body text-base
              border-2 transition-all duration-200
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${
                error
                  ? "border-error bg-red-50 focus:border-error focus:ring-2 focus:ring-error/20"
                  : success
                    ? "border-success bg-green-50 focus:border-success focus:ring-2 focus:ring-success/20"
                    : "border-gray-200 bg-white focus:border-maroon focus:ring-2 focus:ring-maroon/10"
              }
              placeholder:text-gray-400
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error mt-2 animate-fade-in-up">{error}</p>
        )}
        {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
