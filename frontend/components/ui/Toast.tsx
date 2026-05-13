import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

interface ToastProps extends ToastMessage {}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-success text-white border-success/30",
    error: "bg-error text-white border-error/30",
    warning: "bg-warning text-white border-warning/30",
    info: "bg-info text-white border-info/30",
  };

  const typeIcons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-md p-4 rounded-lg
        border shadow-lg flex items-start gap-3
        animate-slide-down
        ${typeStyles[type]}
      `}>
      <div className="flex-shrink-0">{typeIcons[type]}</div>
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};
