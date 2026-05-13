"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { useCartStore } from "@/lib/stores/cart.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Language } from "@/lib/i18n/translations";

export function Navbar() {
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const openDrawer = useCartStore((state) => state.openDrawer);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 80);

      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const shopCategories = [
    { label: t("footer.allProducts", language), href: "/products" },
    { label: t("footer.newArrivals", language), href: "/products?sort=new" },
    { label: t("footer.bestSellers", language), href: "/products?sort=best" },
    { label: t("footer.specialOffers", language), href: "/products?sort=sale" },
  ];

  const userMenuItems =
    user && isAuthenticated
      ? [
          { label: t("nav.myOrders", language), href: "/customer/orders" },
          { label: t("nav.myProfile", language), href: "/customer/profile" },
          { label: t("nav.wishlist", language), href: "/customer/wishlist" },
          ...(user.role === "ADMIN"
            ? [{ label: t("nav.adminPanel", language), href: "/admin" }]
            : []),
          ...(user.role === "VENDOR"
            ? [{ label: t("nav.vendorPanel", language), href: "/vendor" }]
            : []),
        ]
      : [];

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-card" : ""
      } ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-italic text-maroon">
                Habesha
              </span>
              <span className="text-xl font-display font-bold tracking-widest text-maroon">
                BAZAAR
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-maroon transition font-body">
              {t("nav.home", language)}
            </Link>

            <div className="relative group">
              <button className="text-gray-700 hover:text-maroon transition font-body flex items-center gap-1">
                {t("nav.shop", language)}
                <ChevronDown size={16} />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {shopCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gold hover:bg-opacity-10 hover:text-maroon transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="#about"
              className="text-gray-700 hover:text-maroon transition font-body">
              {t("nav.about", language)}
            </Link>

            <Link
              href="/contact"
              className="text-gray-700 hover:text-maroon transition font-body">
              {t("nav.contact", language)}
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-700 hover:text-maroon transition">
              <Search size={20} />
            </button>

            <Link href="/customer/wishlist" className="relative">
              <Heart
                size={20}
                className="text-gray-700 hover:text-maroon transition"
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-maroon text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button onClick={openDrawer} className="relative">
              <ShoppingCart
                size={20}
                className="text-gray-700 hover:text-maroon transition"
              />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-maroon text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            <div className="relative group">
              <button className="text-gray-700 hover:text-maroon transition text-sm font-semibold flex items-center gap-1">
                {language.toUpperCase()}
                <ChevronDown size={16} />
              </button>
              <div className="absolute right-0 mt-0 w-40 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {(["en", "de", "am"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`block w-full text-left px-4 py-2 transition ${
                      language === lang
                        ? "bg-maroon text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    {t(
                      lang === "en"
                        ? "english"
                        : lang === "de"
                          ? "german"
                          : "amharic",
                      language,
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-maroon text-white flex items-center justify-center font-semibold hover:bg-maroon-dark transition">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-gray-700 hover:bg-gold hover:bg-opacity-10 hover:text-maroon transition">
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition border-t border-gray-200">
                    {t("nav.logout", language)}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-6 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition font-semibold">
                  {t("nav.login", language)}
                </button>
              </Link>
            )}

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X size={24} className="text-maroon" />
              ) : (
                <Menu size={24} className="text-maroon" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:text-maroon">
              {t("nav.home", language)}
            </Link>
            <button
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
              className="w-full text-left px-4 py-2 text-gray-700 hover:text-maroon flex justify-between">
              {t("nav.shop", language)}
              <ChevronDown
                size={16}
                className={`transition ${isShopDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isShopDropdownOpen && (
              <div className="bg-gray-50">
                {shopCategories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-8 py-2 text-gray-700 hover:text-maroon">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="#about"
              className="block px-4 py-2 text-gray-700 hover:text-maroon">
              {t("nav.about", language)}
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:text-maroon">
              {t("nav.contact", language)}
            </Link>

            {isAuthenticated && user && (
              <div>
                <div className="border-t border-gray-200 my-2"></div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:text-maroon">
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600">
                  {t("nav.logout", language)}
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-maroon font-semibold">
                  {t("nav.login", language)}
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-maroon font-semibold">
                  {t("nav.register", language)}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
