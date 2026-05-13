"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const translations = {
    en: {
      pageTitle: "Contact Us",
      pageDesc: "Get in Touch",
      heroTitle: "We'd Love to Hear From You",
      heroSubtitle:
        "Have questions or feedback? Reach out to us. We're here to help!",
      getInTouchTitle: "Get in Touch",
      contactForm: "Contact Form",
      name: "Full Name",
      email: "Email Address",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      contactInfo: "Contact Information",
      phone: "Phone",
      address: "Address",
      hours: "Business Hours",
      hoursText:
        "Monday - Friday: 9:00 - 18:00 | Saturday: 10:00 - 16:00 | Sunday: Closed",
      faq: "Frequently Asked Questions",
      faq1Q: "How long does delivery take?",
      faq1A: "Delivery typically takes 2-3 business days within Germany.",
      faq2Q: "What payment methods do you accept?",
      faq2A:
        "We accept credit/debit cards, PayPal, Klarna, and bank transfers.",
      faq3Q: "Can I return products?",
      faq3A:
        "Yes, most items can be returned within 14 days of purchase in original condition.",
      faq4Q: "Do you offer wholesale?",
      faq4A: "Yes! Contact us for wholesale and bulk order inquiries.",
      successMessage: "Thank you for your message! We'll get back to you soon.",
      errorMessage: "An error occurred. Please try again.",
      followUs: "Follow Us",
      connectSocial: "Connect with us on social media",
    },
    de: {
      pageTitle: "Kontaktieren Sie uns",
      pageDesc: "Nehmen Sie Kontakt auf",
      heroTitle: "Wir freuen uns, von Ihnen zu hören",
      heroSubtitle:
        "Haben Sie Fragen oder Feedback? Kontaktieren Sie uns. Wir helfen Ihnen gerne!",
      getInTouchTitle: "Kontakt aufnehmen",
      contactForm: "Kontaktformular",
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      subject: "Betreff",
      message: "Nachricht",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      contactInfo: "Kontaktinformationen",
      phone: "Telefon",
      address: "Adresse",
      hours: "Öffnungszeiten",
      hoursText:
        "Montag - Freitag: 9:00 - 18:00 | Samstag: 10:00 - 16:00 | Sonntag: Geschlossen",
      faq: "Häufig gestellte Fragen",
      faq1Q: "Wie lange dauert die Lieferung?",
      faq1A:
        "Die Lieferung dauert normalerweise 2-3 Geschäftstage innerhalb Deutschlands.",
      faq2Q: "Welche Zahlungsmethoden akzeptieren Sie?",
      faq2A:
        "Wir akzeptieren Kredit-/Debitkarten, PayPal, Klarna und Banktransfers.",
      faq3Q: "Kann ich Produkte zurückgeben?",
      faq3A:
        "Ja, die meisten Artikel können innerhalb von 14 Tagen nach dem Kauf im Originalzustand zurückgegeben werden.",
      faq4Q: "Bieten Sie Großmengenverkauf an?",
      faq4A: "Ja! Kontaktieren Sie uns für Großmengen- und Paketbestellungen.",
      successMessage:
        "Vielen Dank für Ihre Nachricht! Wir melden uns bald bei Ihnen.",
      errorMessage:
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      followUs: "Folgen Sie uns",
      connectSocial: "Verbinden Sie sich mit uns in den sozialen Medien",
    },
    am: {
      pageTitle: "ያግኙን",
      pageDesc: "ግንኙነት ይወሰድ",
      heroTitle: "ወደ እኛ መስማትን ደስ ይሉናል",
      heroSubtitle: "ጥያቄ ወይም ስሌት አለ? እኛን ያግኙ። እኛ ለመርዳት እዚህ ነን!",
      getInTouchTitle: "ግንኙነት ይወሰድ",
      contactForm: "ግንኙነት ቅርጽ",
      name: "ሙሉ ስም",
      email: "ኢሜሪ ገባሪ",
      subject: "ተዋናይ",
      message: "መልእክት",
      send: "መልእክት ላክ",
      sending: "በመላክ ላይ...",
      contactInfo: "ግንኙነት መረጃ",
      phone: "ስልክ",
      address: "አድራሻ",
      hours: "የስራ ሰዓት",
      hoursText: "ሰኞ - ሐምሌ: 9:00 - 18:00 | ቅዳሜ: 10:00 - 16:00 | እሁድ: ዝጋ",
      faq: "ተደጋግሞ የሚጠየቁ ጥያቄዎች",
      faq1Q: "ማጓጓዝ ምን ያህል ይወስዳል?",
      faq1A: "ማጓጓዝ በተለምዶ በጀርመን ውስጥ 2-3 የስራ ቀናት ይወስዳል።",
      faq2Q: "ምን ምን የክፍያ ዘዴዎች ያቀበላሉ?",
      faq2A: "ክሬዲት/ዴቢት ካርድ፣ PayPal፣ Klarna እና ባንክ ዝውውር ተቀበልነው።",
      faq3Q: "ምርቶችን መመለስ እችላለሁ?",
      faq3A: "አዎ፣ አብዛኛዎቹ ንጥሎች በ14 ቀናት ውስጥ በመጀመሪያ ሁኔታ ውስጥ መመለስ ይችላሉ።",
      faq4Q: "ብዙ ሽያጩን አቅርቦ ታለ?",
      faq4A: "አዎ! ለብዙ ቅዳሜ ትዕዛዞች እኛን ያግኙ።",
      successMessage: "ለመልእክትህ ምስጋና! ብዙም ሳይቆይ ወደ እንህ ነገር።",
      errorMessage: "ስህተት ተከስተ። እባክዎ እንደገና ይሞክሩ።",
      followUs: "ይከታተሉን",
      connectSocial: "በማህበራዊ መገናኛ አገናኙን ያገናኙን",
    },
  };

  const content = translations[language];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error(content.errorMessage);
      }

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(content.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="mb-16">
          <h2 className="text-4xl font-display font-bold text-maroon-dark mb-6 text-center">
            {content.heroTitle}
          </h2>
          <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto">
            {content.heroSubtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-card p-8">
              <h3 className="text-2xl font-display font-bold text-maroon-dark mb-6">
                {content.contactForm}
              </h3>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <Send className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700">{content.successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {content.name}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {content.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {content.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {content.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <Send size={20} />
                  {isLoading ? content.sending : content.send}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-xl font-display font-bold text-maroon-dark mb-4">
                {content.contactInfo}
              </h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-maroon flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {content.phone}
                    </p>
                    <p className="text-gray-600">+49 30 12345678</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-maroon flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600">support@habeshan.de</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-maroon flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {content.address}
                    </p>
                    <p className="text-gray-600">
                      Berliner Straße 123
                      <br />
                      10115 Berlin, Germany
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="w-6 h-6 text-maroon flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {content.hours}
                    </p>
                    <p className="text-gray-600 text-sm">{content.hoursText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-display font-bold text-maroon-dark mb-12 text-center">
            {content.faq}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { question: content.faq1Q, answer: content.faq1A },
              { question: content.faq2Q, answer: content.faq2A },
              { question: content.faq3Q, answer: content.faq3A },
              { question: content.faq4Q, answer: content.faq4A },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-card p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-3">
                  {faq.question}
                </h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-gradient-to-r from-maroon/10 to-gold/10 rounded-lg p-12 text-center">
          <h3 className="text-2xl font-display font-bold text-maroon-dark mb-4">
            {content.followUs}
          </h3>
          <p className="text-gray-700 mb-6">{content.connectSocial}</p>
          <div className="flex justify-center gap-6">
            {["Facebook", "Instagram", "WhatsApp"].map((social) => (
              <a
                key={social}
                href="#"
                className="inline-block px-6 py-2 bg-maroon text-white rounded-lg font-semibold hover:bg-maroon-dark transition">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
