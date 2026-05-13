import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "md",
}) => {
  const sizeStyles = {
    sm: "w-64",
    md: "w-96",
    lg: "w-full md:w-1/3",
  };

  const positionStyles = {
    left: "left-0 animate-slide-right",
    right: "right-0 animate-slide-left",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-fade-in-up"
      />

      {/* Drawer */}
      <div
        className={`
          relative bg-white h-full shadow-2xl
          ${sizeStyles[size]}
          ${positionStyles[position]}
        `}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          {title && (
            <h2 className="text-xl font-bold text-maroon-dark font-display">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto hover:bg-gray-100 rounded-full p-1 transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
