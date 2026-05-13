"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-maroon-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-display font-italic text-gold">
                Habesha
              </span>
              <span className="text-xl font-display font-bold tracking-widest text-gold">
                BAZAAR
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              {t("footer.tagline", language)}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {t("footer.description", language)}
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.646.069 4.85 0 3.204-.012 3.584-.07 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://wa.me/49301234567"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.783 1.149c-1.488.694-2.863 1.691-3.99 2.818-1.128 1.127-2.125 2.502-2.819 3.99-.77 1.545-1.162 3.196-1.162 4.847 0 1.65.392 3.302 1.162 4.847.694 1.488 1.691 2.863 2.818 3.99 1.127 1.128 2.502 2.126 3.99 2.819 1.545.77 3.196 1.162 4.847 1.162 1.65 0 3.301-.392 4.846-1.162 1.488-.693 2.863-1.691 3.99-2.818 1.128-1.127 2.126-2.502 2.819-3.99.77-1.545 1.162-3.196 1.162-4.847 0-1.65-.392-3.302-1.162-4.847-.693-1.488-1.691-2.863-2.818-3.99-1.127-1.128-2.502-2.126-3.99-2.819a9.87 9.87 0 00-4.847-1.162z" />
                </svg>
              </a>
              <a
                href="https://telegram.me/habeshabazaar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295-.385 0-.64-.255-.64-.64V9.6c0-.314.256-.57.57-.57h.005c4.782 1.394 8.047 2.216 9.4 2.216.6 0 .933-.226.933-.726 0-.56-1.222-3.62-1.222-3.62z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-6 font-display">
              {t("footer.shop", language)}
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/products" className="hover:text-gold transition">
                  {t("footer.allProducts", language)}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=new"
                  className="hover:text-gold transition">
                  {t("footer.newArrivals", language)}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=best"
                  className="hover:text-gold transition">
                  {t("footer.bestSellers", language)}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?sort=sale"
                  className="hover:text-gold transition">
                  {t("footer.specialOffers", language)}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=coffee"
                  className="hover:text-gold transition">
                  {t("footer.coffee", language)}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=spices"
                  className="hover:text-gold transition">
                  {t("footer.spices", language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-6 font-display">
              {t("footer.service", language)}
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/about" className="hover:text-gold transition">
                  {t("footer.about", language) || "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition">
                  {t("footer.contactUs", language)}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition">
                  {t("footer.faq", language)}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gold transition">
                  {t("footer.shipping", language)}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold transition">
                  {t("footer.returns", language)}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold transition">
                  {t("footer.privacy", language)}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold transition">
                  {t("footer.terms", language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gold mb-6 font-display">
              {t("footer.contact", language)}
            </h3>
            <div className="space-y-4 text-gray-300 text-sm">
              <div>
                <p className="font-semibold text-white mb-1">
                  {language === "de"
                    ? "Adresse"
                    : language === "am"
                      ? "ዋና ስ"
                      : "Address"}
                </p>
                <p>{t("footer.address", language)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gold" />
                <a
                  href="tel:+49301234567"
                  className="hover:text-gold transition">
                  {t("footer.phone", language)}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gold" />
                <a
                  href="mailto:info@habeshan.de"
                  className="hover:text-gold transition">
                  {t("footer.email", language)}
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white mb-3">
                {t("footer.payment", language)}
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-white text-maroon px-2 py-1 text-xs rounded font-semibold">
                  Visa
                </span>
                <span className="bg-white text-maroon px-2 py-1 text-xs rounded font-semibold">
                  MC
                </span>
                <span className="bg-white text-maroon px-2 py-1 text-xs rounded font-semibold">
                  PayPal
                </span>
                <span className="bg-white text-maroon px-2 py-1 text-xs rounded font-semibold">
                  Klarna
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-maroon-light pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-gray-400 text-sm">
            {/* Copyright */}
            <p>{t("footer.copyright", language)}</p>

            {/* Shipping Logos */}
            <div className="flex justify-center gap-4">
              <span className="bg-white text-maroon px-3 py-1 rounded text-xs font-semibold">
                DHL
              </span>
              <span className="bg-white text-maroon px-3 py-1 rounded text-xs font-semibold">
                Hermes
              </span>
              <span className="bg-white text-maroon px-3 py-1 rounded text-xs font-semibold">
                DPD
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex justify-end gap-4">
              <Link href="/imprint" className="hover:text-gold transition">
                {t("footer.imprint", language)}
              </Link>
              <Link href="/privacy" className="hover:text-gold transition">
                {t("footer.privacy", language)}
              </Link>
              <Link href="/terms" className="hover:text-gold transition">
                {t("footer.terms", language)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
