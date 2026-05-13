"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ToastContainer } from "@/components/layout/ToastContainer";
import {
  HeroSection,
  CategoryShowcase,
  FeaturedProducts,
  PromoBanner,
  WhyChooseUs,
  Testimonials,
  Newsletter,
} from "@/components/home/HomeSections";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <CategoryShowcase />
        <FeaturedProducts />
        <PromoBanner />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
