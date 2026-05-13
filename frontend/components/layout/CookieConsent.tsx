"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

export function CookieConsent() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("cookieConsent");
    if (!consentGiven) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-maroon p-4 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            {language === "de"
              ? "Wir verwenden Cookies, um dein Erlebnis zu verbessern. Durch die Nutzung unserer Website stimmst du unserer Cookie-Richtlinie zu."
              : language === "am"
                ? "ሞክሩአንዎን ለማሻሻል ኩኪዎችን እንጠቀማለን። ጣቢያአንን በመጠቀም ኩኪ ፖሊሲአንን ይስማማሉ።"
                : "We use cookies to improve your experience. By using our site, you consent to our cookie policy."}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/privacy">
            <button className="px-4 py-2 text-maroon font-semibold hover:underline text-sm">
              {t("cookie.privacy", language)}
            </button>
          </Link>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-maroon text-white rounded font-semibold hover:bg-maroon-dark transition text-sm">
            {t("cookie.accept", language)}
          </button>
        </div>
      </div>
    </div>
  );
}
