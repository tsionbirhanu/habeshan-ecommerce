"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { formatPrice } from "@/lib/cart/cartUtils";

interface CartItemProps {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export const CartItem = ({
  id,
  productId,
  productName,
  price,
  quantity,
  image,
  category,
  onQuantityChange,
  onRemove,
}: CartItemProps) => {
  const { language } = useLanguage();
  const lineTotal = price * quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded border-2 border-transparent hover:border-maroon transition-colors overflow-hidden bg-gray-100">
        {image ? (
          <Image src={image} alt={productName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        {/* Name and Category */}
        <h3 className="text-lg font-display font-bold text-gray-900 mb-1">
          {productName}
        </h3>
        {category && (
          <span className="inline-block mb-2 px-2 py-1 bg-maroon/10 text-maroon text-xs font-semibold rounded">
            {category}
          </span>
        )}

        {/* Price and Line Total Row */}
        <div className="flex items-center justify-between mt-3 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              {formatPrice(price)} x {quantity}
            </div>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={onQuantityChange}
              minQuantity={1}
              maxQuantity={999}
            />
          </div>

          {/* Line Total */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">
              {t("cart.lineTotal", language)}
            </p>
            <p className="text-xl font-bold text-maroon">
              {formatPrice(lineTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="self-start mt-2 p-2 text-gray-400 hover:text-maroon hover:bg-maroon/10 rounded transition-colors"
        aria-label={t("cart.remove", language)}
        title={t("cart.remove", language)}>
        <X size={20} />
      </button>
    </div>
  );
};
