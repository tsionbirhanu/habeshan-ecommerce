"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  CheckCircle,
  Truck,
  ShieldCheck,
  MessageCircle,
  Star,
  Mail,
  ArrowRight,
  ArrowRightCircle,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";

// Helper for quick translations without relying strictly on translation files
const tHelpers = {
  heroTitle0: {
    en: "Taste of Home,\nDelivered to\nGermany.",
    de: "Geschmack der Heimat,\ngeliefert nach\nDeutschland.",
    am: "የሀገርዎ ጣዕም፣\nእስከ ጀርመን ድረስ።",
  },
  heroSub0: {
    en: "Discover the finest Ethiopian and Eritrean products — Spices, Coffee, Grains, and more.",
    de: "Entdecke die feinsten äthiopischen und eritreischen Produkte — Gewürze, Kaffee, Getreide und mehr.",
    am: "ምርጥ የኢትዮጵያ እና የኤርትራ ምርቶችን ያግኙ — ቅመማ ቅመም፣ ቡና፣ እህል እና ሌሎችም።",
  },
  heroTitle1: {
    en: "Artisanal Heritage,\nPremium Quality.",
    de: "Handwerkliche Tradition,\nPremium Qualität.",
    am: "ያልተበረዘ ቅርስ፣\nጥሩ ጥራት።",
  },
  heroSub1: {
    en: "Elevate your cooking with authentic Berbere, Shiro, and exotic ingredients.",
    de: "Verfeinern Sie Ihre Gerichte mit authentischem Berbere, Shiro und exotischen Zutaten.",
    am: "በእውነተኛ በርበሬ፣ ሽሮ እና ልዩ በሆኑ ግብዓቶች ማብሰልዎን ያሻሽሉ።",
  },
  heroTitle2: {
    en: "Experience The Culture,\nFeel The Quality.",
    de: "Erlebe die Kultur,\nfühle die Qualität.",
    am: "ባህሉን ይለማመዱ፣\nጥራቱ ይሰማዎት።",
  },
  heroSub2: {
    en: "100% natural, ethically sourced from the horn of Africa straight to you.",
    de: "100% natürlich, ethisch aus dem Horn von Afrika direkt zu Ihnen bezogen.",
    am: "100% ተፈጥሯዊ፣ ከኣፍሪካ ቀንድ በቀጥታ ወደ እርስዎ የተላከ።",
  },
  shopNow: { en: "Shop Now", de: "Jetzt Einkaufen", am: "አሁን ይግዙ" },
  ourProducts: { en: "Our Products", de: "Unsere Produkte", am: "ምርቶቻችን" },
  freeShipping: {
    en: "🚚 Free over €50",
    de: "🚚 Kostenlos ab €50",
    am: "🚚 ከ €50 በላይ ነፃ",
  },
  authentic: {
    en: "✓ Authentic & Original",
    de: "✓ Authentisch & Original",
    am: "✓ እውነተኛ እና ኦሪጅናል",
  },
  germany: { en: "🇩🇪 In Germany", de: "🇩🇪 In Deutschland", am: "🇩🇪 በጀርመን" },
  categories: {
    en: "Discover our Categories",
    de: "Entdecke unsere Kategorien",
    am: "ክፍሎቻችንን ያግኙ",
  },
  bestsellers: {
    en: "Our Bestsellers",
    de: "Unsere Bestseller",
    am: "የእኛ ምርጥ ሻጮች",
  },
  viewAll: {
    en: "View All Products",
    de: "Alle Produkte ansehen",
    am: "ሁሉንም ምርቶች ይመልከቱ",
  },
  promoTag: { en: "WEEKLY OFFER", de: "WOCHEN-ANGEBOT", am: "ሳምንታዊ ቅናሽ" },
  promoTitle: {
    en: "Ethiopian Yirgacheffe Coffee",
    de: "Äthiopischer Yirgacheffe Kaffee",
    am: "የኢትዮጵያ ይርጋጨፌ ቡና",
  },
  addToCart: { en: "Add to Cart", de: "In den Warenkorb", am: "ወደ ጋሪ አክል" },
  whyUs: { en: "Why Choose Us", de: "Warum wir?", am: "ለምን እኛን ይመርጣሉ?" },
  testimonials: {
    en: "What Our Customers Say",
    de: "Was unsere Kunden sagen",
    am: "ደንበኞቻችን ምን ይላሉ",
  },
  newsletterTitle: {
    en: "Don't Miss Any Updates",
    de: "Verpasse keine Neuigkeit",
    am: "ምንም አዳዲስ መረጃዎችን አያምልጥዎ",
  },
  subscribe: { en: "Subscribe", de: "Abonnieren", am: "ይመዝገቡ" },
  gdpr: {
    en: "GDPR compliant. Unsubscribe anytime.",
    de: "DSGVO-konform. Jederzeit abmeldbar.",
    am: "GDPR ያከብራል። በማንኛውም ጊዜ ከደንበኝነት ምዝገባ መውጣት ይችላሉ።",
  },
};

const getT = (key: keyof typeof tHelpers, lang: string) => {
  return (
    tHelpers[key][lang as keyof (typeof tHelpers)[typeof key]] ||
    tHelpers[key]["en"]
  );
};

export function HeroSection() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: "/images/coffee.jpg", titleKey: "heroTitle0", subKey: "heroSub0" },
    { image: "/images/spices.jpg", titleKey: "heroTitle1", subKey: "heroSub1" },
    { image: "", titleKey: "heroTitle2", subKey: "heroSub2" },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[currentSlide];

  return (
    <section className="relative min-h-[90vh] flex items-center bg-maroon-dark overflow-hidden transition-colors duration-1000">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        {/* Subtle dark gradient just for text legibility, no burgundy mask */}
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-1000" />
        {current.image && (
          <Image
            key={current.image}
            src={current.image}
            alt="Habesha Hero"
            fill
            className="object-cover object-center animate-in fade-in zoom-in-[1.05] duration-[3000ms] ease-out"
            priority
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center justify-center w-full h-full">
        {/* Centered Content */}
        <div className="w-full max-w-5xl text-center pt-20 pb-16 md:py-0">
          <div
            key={currentSlide}
            className="animate-in fade-in slide-in-from-bottom-8 duration-[1500ms] ease-out">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white mb-6 leading-tight whitespace-pre-line drop-shadow-lg line-clamp-2">
              {getT(current.titleKey as keyof typeof tHelpers, language)}
            </h1>

            <p className="text-lg md:text-xl xl:text-2xl text-white/90 font-light mb-10 max-w-3xl mx-auto drop-shadow-md">
              {getT(current.subKey as keyof typeof tHelpers, language)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-[1500ms] delay-300 ease-out fill-mode-both">
            <Link href="/products">
              <button className="group relative px-8 py-3 bg-gradient-to-r from-gold to-gold-light text-maroon-dark font-bold rounded-lg hover:shadow-[0_8px_32px_rgba(212,175,55,0.4)] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest text-xs border-2 border-gold hover:border-gold-light hover:scale-105 transform">
                <span className="relative z-10">{getT("shopNow", language)}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </button>
            </Link>
            <Link href="/categories">
              <button className="group relative px-6 py-3 bg-gradient-to-r from-transparent to-transparent text-white font-bold rounded-lg border-2 border-white/50 hover:border-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] hover:scale-105 transform">
                <span className="relative z-10">{getT("ourProducts", language)}</span>
                <ArrowRightCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryShowcase() {
  const { language } = useLanguage();
  const categories = [
    {
      name: "Spices & Herbs",
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
      count: 12,
    },
    {
      name: "Coffee",
      image:
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop",
      count: 8,
    },
    {
      name: "Grains & Flours",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d9973?w=500&auto=format&fit=crop",
      count: 15,
    },
    {
      name: "Snacks",
      image:
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d9973?w=500&auto=format&fit=crop",
      count: 5,
    },
    {
      name: "Traditional Wears",
      image:
        "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop",
      count: 20,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-maroon-dark text-center mb-12">
          {getT("categories", language)}
        </h2>

        <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-6 pb-8 md:pb-0 snap-x">
          {categories.map((cat, i) => (
            <Link
              href={`/products?category=${cat.name.toLowerCase()}`}
              key={i}
              className="min-w-[200px] snap-center group">
              <div className="flex flex-col items-center">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 relative transition duration-300 group-hover:shadow-[0_0_0_4px_#6B1C1C]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-maroon transition">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {cat.count} {language === "de" ? "Produkte" : "Products"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-maroon font-semibold uppercase tracking-wider text-sm mb-2 block animate-in fade-in">
              {language === "de" ? "Entdecke" : "Discover"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              {getT("bestsellers", language)}
            </h2>
          </div>
          <Link href="/products" className="hidden md:flex">
             <button className="text-maroon-dark font-semibold flex items-center gap-2 hover:text-maroon transition-colors group">
              {getT("viewAll", language)} 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden border border-gray-100/60 flex flex-col hover:-translate-y-2">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden isolate">
                <img
                  src={`https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop`}
                  alt="Product"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-maroon shadow-sm leading-none">
                    Best Seller
                  </span>
                </div>

                {/* Quick Add Button (appears on hover) */}
                <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <button className="w-full py-3 bg-white/95 backdrop-blur-md text-maroon-dark font-bold rounded-xl shadow-lg hover:bg-maroon hover:text-white transition-colors flex items-center justify-center gap-2">
                    <span className="text-sm uppercase tracking-wide">Add to Cart</span>
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="text-gold"
                      fill="currentColor"
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1 font-medium">(24)</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-maroon transition-colors duration-300">
                  Premium Berbere Spice
                </h3>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">Authentic Ethiopian Blend</p>
                
                <div className="mt-auto flex justify-between items-end">
                  <div>
                    <span className="text-xs text-gray-400 line-through block">€18.99</span>
                    <span className="text-2xl font-bold text-maroon">€14.99</span>
                  </div>
                  
                  {/* Subtle cart icon for mobile/default state */}
                  <button className="md:hidden bg-maroon/10 text-maroon w-10 h-10 rounded-full flex items-center justify-center hover:bg-maroon hover:text-white transition-colors">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/products">
            <button className="w-full py-4 bg-maroon text-white font-bold rounded-xl hover:bg-maroon-dark transition shadow-md flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
              {getT("viewAll", language)} <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PromoBanner() {
  const { language } = useLanguage();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-maroon-dark/95 z-10" />
        <img
          src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=2000&auto=format&fit=crop"
          alt="Coffee beans"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-20 text-center text-white">
        <span className="inline-block bg-gold text-maroon-dark px-4 py-1 font-bold text-sm tracking-wider uppercase mb-6 rounded">
          {getT("promoTag", language)}
        </span>
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
          {getT("promoTitle", language)}
        </h2>

        <div className="flex justify-center gap-6 mb-10">
          {["12", "05", "45", "30"].map((num, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 w-16 h-20 md:w-20 md:h-24 flex items-center justify-center rounded-lg mb-2">
                <span className="text-3xl md:text-4xl font-bold text-gold">
                  {num}
                </span>
              </div>
              <span className="text-xs text-gray-300 uppercase tracking-wider">
                {["Days", "Hrs", "Min", "Sec"][i]}
              </span>
            </div>
          ))}
        </div>

        <button className="px-10 py-4 bg-gold text-maroon-dark font-bold text-lg rounded hover:bg-gold-light transition uppercase shadow-xl hover:shadow-gold/20 hover:-translate-y-1">
          {getT("addToCart", language)} - €19.99
        </button>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const { language } = useLanguage();
  const features = [
    {
      icon: Star,
      title: language === "de" ? "100% Authentisch" : "100% Authentic",
      desc:
        language === "de" ? "Direkt aus Äthiopien" : "Directly from Ethiopia",
    },
    {
      icon: Truck,
      title: language === "de" ? "Schnelle Lieferung" : "Fast Delivery",
      desc:
        language === "de"
          ? "DHL, Hermes, DPD — 2-5 Tage"
          : "DHL, Hermes, DPD — 2-5 Days",
    },
    {
      icon: ShieldCheck,
      title: language === "de" ? "Premium Qualität" : "Premium Quality",
      desc:
        language === "de"
          ? "Handverlesen und geprüft"
          : "Hand-picked and verified",
    },
    {
      icon: MessageCircle,
      title: language === "de" ? "Kundenservice" : "Customer Service",
      desc:
        language === "de"
          ? "WhatsApp & Telegram Support"
          : "WhatsApp & Telegram Support",
    },
  ];

  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-display font-bold text-maroon-dark text-center mb-16">
          {getT("whyUs", language)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-off-white p-8 rounded-xl text-center border-t-4 border-maroon hover:shadow-card transition duration-300">
                <div className="bg-maroon/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 text-maroon">
                  <Icon size={32} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {feat.title}
                </h3>
                <p className="text-gray-600 text-sm">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { language } = useLanguage();

  return (
    <section className="py-24 bg-off-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-maroon-dark text-center mb-16">
          {getT("testimonials", language)}
        </h2>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[320px] md:min-w-[400px] flex-1 bg-white p-8 rounded-2xl shadow-sm snap-center border border-gray-100">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={20}
                    className="text-gold"
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "The quality of the Teff flour is incredible. It makes the
                perfect Injera that reminds me of home. Shipping was also
                extremely fast within Germany!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-400">
                  AA
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Abebe A.</h4>
                  <span className="text-xs bg-maroon/10 text-maroon px-2 py-1 rounded font-semibold uppercase">
                    {language === "de"
                      ? "Verifizierter Kauf"
                      : "Verified Buyer"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const { language } = useLanguage();
  return (
    <section className="py-24 bg-maroon-dark text-white text-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Mail size={48} className="mx-auto text-gold mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
          {getT("newsletterTitle", language)}
        </h2>
        <p className="text-gray-300 mb-10 max-w-xl mx-auto">
          Get weekly updates on new products, authentic recipes, and special
          discounts.
        </p>

        <form
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6"
          onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="E-Mail Adresse..."
            className="flex-1 px-6 py-4 rounded bg-white text-gray-900 outline-none focus:ring-2 focus:ring-gold"
            required
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gold text-maroon-dark font-bold rounded hover:bg-gold-light transition whitespace-nowrap">
            {getT("subscribe", language)}
          </button>
        </form>
        <p className="text-xs text-gray-400">{getT("gdpr", language)}</p>
      </div>
    </section>
  );
}
