"use client";

import { ProductCard } from "./ProductCard";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { MockProduct } from "@/lib/mock-data";

interface RelatedProductsProps {
  products: MockProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { language } = useLanguage();
  
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 border-t border-gray-200">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        {t("product.relatedProducts", language)}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
