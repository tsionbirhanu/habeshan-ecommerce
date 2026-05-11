import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habesha Bazaar - Ethiopian & Eritrean eCommerce",
  description: "Shop authentic Ethiopian and Eritrean products in Germany",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-off-white text-gray-800 font-body">
        {children}
      </body>
    </html>
  );
}
