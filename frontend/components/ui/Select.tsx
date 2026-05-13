import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (selectedValue: string | number) => {
    onChange?.(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2.5 rounded-lg font-body text-base
            border-2 transition-all duration-200 text-left
            flex items-center justify-between
            ${
              error
                ? "border-error bg-red-50"
                : "border-gray-200 bg-white hover:border-maroon focus:border-maroon focus:ring-2 focus:ring-maroon/10"
            }
          `}>
          <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`text-maroon transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-4 py-2 transition-colors
                  hover:bg-maroon/10 hover:text-maroon
                  border-b border-gray-100 last:border-0
                  ${value === option.value ? "bg-maroon/5 text-maroon font-semibold" : ""}
                `}>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-error mt-2 animate-fade-in-up">{error}</p>
      )}
    </div>
  );
};
