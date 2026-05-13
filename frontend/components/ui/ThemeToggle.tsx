import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  const handleToggle = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Toggle theme">
      {isDark ? (
        <Sun size={20} className="text-gold" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  );
};
