"use client";

import React, { useEffect } from "react";
import { useUIStore } from "@/lib/stores/ui.store";
import { Check, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  };
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-50 border border-green-200 text-green-800",
    error: "bg-red-50 border border-red-200 text-red-800",
    warning: "bg-amber-50 border border-amber-200 text-amber-800",
    info: "bg-blue-50 border border-blue-200 text-blue-800",
  };

  const icons = {
    success: <Check size={20} className="text-green-600" />,
    error: <AlertCircle size={20} className="text-red-600" />,
    warning: <AlertTriangle size={20} className="text-amber-600" />,
    info: <Info size={20} className="text-blue-600" />,
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded shadow-lg animate-fade-in-up ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition">
        <X size={18} />
      </button>
    </div>
  );
}
