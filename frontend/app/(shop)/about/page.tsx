"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import {
  CheckCircle,
  Truck,
  ShieldCheck,
  Heart,
  Users,
  Leaf,
} from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const { language } = useLanguage();

  const translations = {
    en: {
      pageTitle: "About Habesha Bazaar",
      pageDesc: "Our Story & Mission",
      heroTitle: "Connecting Cultures Through Authentic Products",
      heroSubtitle:
        "Bridging the gap between traditional Ethiopian and Eritrean heritage and modern German living.",
      missionTitle: "Our Mission",
      missionDesc:
        "To provide authentic, high-quality Ethiopian and Eritrean products to the diaspora community in Germany while supporting traditional producers and preserving cultural heritage.",
      visionTitle: "Our Vision",
      visionDesc:
        "A world where cultural authenticity is celebrated, where diaspora communities can easily access home products, and where traditional artisans thrive through fair trade practices.",
      valuesTitle: "Our Values",
      value1Title: "Authenticity",
      value1Desc:
        "We only source genuine products directly from trusted producers in Ethiopia and Eritrea.",
      value2Title: "Quality",
      value2Desc:
        "Every product is carefully selected and tested to meet our high quality standards.",
      value3Title: "Sustainability",
      value3Desc:
        "We support eco-friendly practices and fair trade to ensure sustainable growth.",
      value4Title: "Community",
      value4Desc:
        "We celebrate and support the diaspora community by making their heritage accessible.",
      storyTitle: "Our Story",
      storyText:
        "Habesha Bazaar was founded with a passion for bringing authentic Ethiopian and Eritrean products to the German market. Our founders, members of the diaspora community themselves, understood the challenges of finding genuine products from home. What started as a small initiative has grown into a thriving marketplace, serving thousands of satisfied customers.",
      statsTitle: "By The Numbers",
      stat1Label: "Happy Customers",
      stat1Value: "5,000+",
      stat2Label: "Products Listed",
      stat2Value: "500+",
      stat3Label: "Trusted Vendors",
      stat3Value: "50+",
      stat4Label: "Cities Served",
      stat4Value: "100+",
      whyChooseTitle: "Why Choose Us",
      why1Title: "Fast Shipping",
      why1Desc: "Delivery across Germany in 2-3 business days",
      why2Title: "Authentic Products",
      why2Desc: "Directly sourced from producers in the Horn of Africa",
      why3Title: "Secure Payment",
      why3Desc: "Multiple payment options including PayPal and Klarna",
      why4Title: "Customer Support",
      why4Desc: "24/7 support via email, WhatsApp, and phone",
      teamTitle: "Meet Our Team",
      teamDesc:
        "A diverse team dedicated to bringing you the best products and service.",
    },
    de: {
      pageTitle: "Über Habesha Bazaar",
      pageDesc: "Unsere Geschichte & Mission",
      heroTitle: "Kulturen durch authentische Produkte verbinden",
      heroSubtitle:
        "Die Lücke zwischen traditionellem äthiopischem und eritreischem Erbe und modernem Leben in Deutschland schließen.",
      missionTitle: "Unsere Mission",
      missionDesc:
        "Authentische, hochwertige äthiopische und eritreische Produkte für die Diaspora-Gemeinschaft in Deutschland bereitstellen und traditionelle Produzenten unterstützen sowie kulturelles Erbe bewahren.",
      visionTitle: "Unsere Vision",
      visionDesc:
        "Eine Welt, in der kulturelle Authentizität gefeiert wird, in der Diaspora-Gemeinschaften leicht auf Heimatprodukte zugreifen können und traditionelle Handwerker durch faire Handelspraktiken gedeihen.",
      valuesTitle: "Unsere Werte",
      value1Title: "Authentizität",
      value1Desc:
        "Wir beziehen nur echte Produkte direkt von vertrauenswürdigen Produzenten in Äthiopien und Eritrea.",
      value2Title: "Qualität",
      value2Desc:
        "Jedes Produkt wird sorgfältig ausgewählt und getestet, um unsere hohen Qualitätsstandards zu erfüllen.",
      value3Title: "Nachhaltigkeit",
      value3Desc:
        "Wir unterstützen umweltfreundliche Praktiken und fairen Handel für nachhaltiges Wachstum.",
      value4Title: "Gemeinschaft",
      value4Desc:
        "Wir würdigen und unterstützen die Diaspora-Gemeinschaft, indem wir ihr Erbe zugänglich machen.",
      storyTitle: "Unsere Geschichte",
      storyText:
        "Habesha Bazaar wurde mit der Leidenschaft gegründet, authentische äthiopische und eritreische Produkte auf den deutschen Markt zu bringen. Unsere Gründer, selbst Mitglieder der Diaspora-Gemeinschaft, verstanden die Herausforderungen beim Finden echter Produkte von zu Hause. Was als kleine Initiative begann, ist heute ein florierendes Marktplatz mit Tausenden zufriedener Kunden.",
      statsTitle: "Nach den Zahlen",
      stat1Label: "Zufriedene Kunden",
      stat1Value: "5.000+",
      stat2Label: "Aufgelistete Produkte",
      stat2Value: "500+",
      stat3Label: "Vertrauenswürdige Verkäufer",
      stat3Value: "50+",
      stat4Label: "Betreute Städte",
      stat4Value: "100+",
      whyChooseTitle: "Warum uns wählen",
      why1Title: "Schneller Versand",
      why1Desc: "Lieferung in Deutschland in 2-3 Arbeitstagen",
      why2Title: "Authentische Produkte",
      why2Desc: "Direkt von Produzenten am Horn von Afrika bezogen",
      why3Title: "Sichere Zahlung",
      why3Desc: "Mehrere Zahlungsoptionen einschließlich PayPal und Klarna",
      why4Title: "Kundensupport",
      why4Desc: "24/7 Support per E-Mail, WhatsApp und Telefon",
      teamTitle: "Lernen Sie unser Team kennen",
      teamDesc:
        "Ein vielfältiges Team, das sich der Bereitstellung der besten Produkte und Dienstleistungen widmet.",
    },
    am: {
      pageTitle: "ስለ ሃበሻ ባዛር",
      pageDesc: "ታሪካችን እና ተልዕኮ",
      heroTitle: "ባህልን በእውነተኛ ምርቶች ያገናኙ",
      heroSubtitle:
        "በተለመደው ኢትዮጵያዊ እና ኤርትራዊ ቅርስ እና ዘመናዊ ጀርመናዊ ሕይወት መካከል ያለውን ክፍተት ይዝጉ።",
      missionTitle: "የእኛ ተልዕኮ",
      missionDesc:
        "በጀርመን ውስጥ ለሚኖሩ ኢትዮጵያውያን እና ኤርትራውያን ማህበረሰብ እውነተኛ፣ ከፍተኛ ምንጭ የሆነ ምርቶችን ማቅረብ እና ባህላዊ ምርት ማለያያንዎችን ድጋፍ እና ባህላዊ ውርስ ማስቀጠል።",
      visionTitle: "የእኛ ራእይ",
      visionDesc:
        "ባህላዊ ቅንጣዊነት ለመክበር የሚደረግበት ሕግ፣ አልወግድ ማህበረሰቦች ቤትህን ምርቶች መደርደር የሚችሉበት ምድር እና ባህላዊ ሸቀን ስራዎች በፍትሃዊ ንግድ ሁኔታዎች ሴላት መዘርዘር።",
      valuesTitle: "ዋጋቸን",
      value1Title: "እውነተኝነት",
      value1Desc: "ውድ ምርቶችን ብቻ በቅድሚያ የሚያማምን ባህላዊ ምርትበሪዎች ዳገት ላይ እንሰባስባለን።",
      value2Title: "ጥራት",
      value2Desc: "እያንዳንዱ ምርት ከልኬታችን ከፍ ያለ ጥራት ለመወጣት በጉጉት ተመርጣ እና ተሞክሮ ነበር።",
      value3Title: "ህንዳዊ ምግባር",
      value3Desc: "환경 にやさしい ባልደረባዎቹ ድጋፍ እና ፍትሃዊ ንግድ ለቁጥር በሁሉ ሊሴሪ።",
      value4Title: "ማህበረሰብ",
      value4Desc: "የ ሪዮታ ማህበረሰብን ካሳ ለመስጠት ናቸው ወዳልታሪክ ዋጋ።",
      storyTitle: "ታሪካችን",
      storyText:
        "ሃበሻ ባዛር በኢትዮጵያዊ እና ኤርትራዊ እውነተኛ ምርቶች ወደ ጀርመን ገበያ ለመመጣት በታላቅ ፍላጎት ተመሰረተ። ለራሳቸው የቅድሚያ መስመሩ ይሁን የኛ ስር ደሰ ተማረ ምሁራን ምን ምኩ ቤታቸው ምን ምኩ ምርቶች ክሩ ላለሩ ብዙ ችግር ነበር። ትንሽ ታሪክ ሲሆን ትንሳኤ አስር ሺህ እየመራ ትመገጆ ነጎለበቅ ነብሎች አሳ።",
      statsTitle: "በ ቁጥር",
      stat1Label: "ደስተኛ ደንበኞች",
      stat1Value: "5,000+",
      stat2Label: "የተዘርዘሩ ምርቶች",
      stat2Value: "500+",
      stat3Label: "ታማኝ ሽያጭ አቅባሪዎች",
      stat3Value: "50+",
      stat4Label: "ተጣበቁ ከተሞች",
      stat4Value: "100+",
      whyChooseTitle: "ለምን እኛን ይመርጡ",
      why1Title: "ፍጥጫ ማጓጓዝ",
      why1Desc: "በጀርመን ውስጥ 2-3 የስራ ቀናት ውስጥ ማጓጓዝ",
      why2Title: "እውነተኛ ምርቶች",
      why2Desc: "በቀጥታ ከአፍሪካ ቀንድ ምርትበሪዎች ድንገተ",
      why3Title: "ደህንነቱ ዋስትና የሚሰጥ ክፍያ",
      why3Desc: "ብዙ ክፍያ አማራጮች ትርቢ ፔል እና ክላርና",
      why4Title: "ደንበኛ ድጋፍ",
      why4Desc: "24/7 ድጋፍ ኢሜል፣ WhatsApp እና ስልክ በእርግጠኝነት",
      teamTitle: "ሙሉ ቡድናችንን ይወቁ",
      teamDesc: "የተለያዩ ሙሉ ቡድን ምርጥ ምርቶች እና ስራ ማቅረብ ከግዚፎት።",
    },
  };

  const content = translations[language];

  return (
    <div className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-maroon to-maroon-dark text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            {content.pageTitle}
          </h1>
          <p className="text-xl text-maroon-light">{content.pageDesc}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Content */}
        <div className="mb-20">
          <h2 className="text-4xl font-display font-bold text-maroon-dark mb-6 text-center">
            {content.heroTitle}
          </h2>
          <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto">
            {content.heroSubtitle}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-lg shadow-card p-8">
            <h3 className="text-2xl font-display font-bold text-maroon mb-4">
              {content.missionTitle}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {content.missionDesc}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-card p-8">
            <h3 className="text-2xl font-display font-bold text-maroon mb-4">
              {content.visionTitle}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {content.visionDesc}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-display font-bold text-maroon-dark mb-12 text-center">
            {content.valuesTitle}
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: content.value1Title,
                desc: content.value1Desc,
                icon: Heart,
              },
              {
                title: content.value2Title,
                desc: content.value2Desc,
                icon: ShieldCheck,
              },
              {
                title: content.value3Title,
                desc: content.value3Desc,
                icon: Leaf,
              },
              {
                title: content.value4Title,
                desc: content.value4Desc,
                icon: Users,
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon className="w-12 h-12 text-maroon" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900">
                    {value.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-lg shadow-card p-12 mb-20">
          <h3 className="text-3xl font-display font-bold text-maroon-dark mb-6">
            {content.storyTitle}
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {content.storyText}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-maroon/10 to-gold/10 rounded-lg p-12 mb-20">
          <h3 className="text-3xl font-display font-bold text-maroon-dark mb-12 text-center">
            {content.statsTitle}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: content.stat1Label, value: content.stat1Value },
              { label: content.stat2Label, value: content.stat2Value },
              { label: content.stat3Label, value: content.stat3Value },
              { label: content.stat4Label, value: content.stat4Value },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-maroon mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-700 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h3 className="text-3xl font-display font-bold text-maroon-dark mb-12 text-center">
            {content.whyChooseTitle}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: content.why1Title, desc: content.why1Desc, icon: Truck },
              {
                title: content.why2Title,
                desc: content.why2Desc,
                icon: CheckCircle,
              },
              {
                title: content.why3Title,
                desc: content.why3Desc,
                icon: ShieldCheck,
              },
              { title: content.why4Title, desc: content.why4Desc, icon: Heart },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-4 bg-white p-6 rounded-lg shadow-card">
                  <Icon className="w-8 h-8 text-maroon flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
