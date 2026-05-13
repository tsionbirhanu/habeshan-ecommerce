"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { ProductDetail } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

interface StickyAddToCartProps {
  product: ProductDetail;
  onAddToCart: (quantity: number) => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export function StickyAddToCart({
  product,
  onAddToCart,
  isVisible,
  isLoading = false,
}: StickyAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const { language } = useLanguage();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Product info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-maroon">
                €{product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Quantity */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition">
                −
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 transition">
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(quantity)}
              disabled={isLoading || !product.inStock}
              className="hidden sm:flex items-center gap-2 px-6 py-2 bg-maroon text-white font-bold rounded-lg hover:bg-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap">
              <ShoppingCart size={18} />
              {isLoading ? "..." : t("product.addToCart", language)}
            </button>

            {/* Mobile add button */}
            <button
              onClick={() => onAddToCart(quantity)}
              disabled={isLoading || !product.inStock}
              className="sm:hidden px-6 py-2 bg-maroon text-white font-bold rounded-lg hover:bg-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed transition">
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
