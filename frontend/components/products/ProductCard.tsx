"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { MockProduct } from "@/lib/mock-data";

interface ProductCardProps {
  product: MockProduct;
  isListView?: boolean;
  onAddToCart?: (quantity: number) => void;
  isLoadingCart?: boolean;
}

export function ProductCard({
  product,
  isListView = false,
  onAddToCart,
  isLoadingCart = false,
}: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  if (isListView) {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 flex gap-6 items-stretch">
        {/* Image */}
        <div className="relative w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.isNew && (
            <div className="absolute top-3 left-3 bg-gold text-maroon-dark text-xs font-bold px-3 py-1 rounded-full">
              New
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">
              {product.category}
            </p>
            <Link href={`/products/${product.id}`}>
              <h3 className="font-bold text-gray-900 text-lg hover:text-maroon transition line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(product.rating)
                        ? "text-gold fill-gold"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-maroon">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {!product.inStock && (
                <p className="text-xs text-red-500 font-semibold mt-1">
                  Out of Stock
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                <Heart size={20} />
              </button>
              <button
                disabled={!product.inStock}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition ${
                  product.inStock
                    ? "bg-maroon text-white hover:bg-maroon-dark"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}>
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100/60 group flex flex-col h-full hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden isolate">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="bg-gold text-maroon-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-sm leading-none">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm leading-none">
                -{discount}%
              </span>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}

          {/* Quick Add Button (appears on hover) */}
          <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <button
              onClick={() => onAddToCart?.(1)}
              disabled={!product.inStock || isLoadingCart}
              className={`w-full py-3 font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition ${
                product.inStock
                  ? "bg-white/95 backdrop-blur-md text-maroon-dark hover:bg-maroon hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}>
              <ShoppingCart size={18} />
              <span className="text-sm uppercase tracking-wide">
                {isLoadingCart
                  ? "..."
                  : product.inStock
                    ? "Add to Cart"
                    : "Unavailable"}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2 leading-none">
            {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < Math.floor(product.rating)
                    ? "text-gold fill-gold"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="text-xs text-gray-500 ml-1 font-medium">
              ({product.reviewCount})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-maroon transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-xs mb-4 line-clamp-1 flex-grow">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through block">
                  €{product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-maroon">
                €{product.price.toFixed(2)}
              </span>
            </div>

            {/* Subtle cart icon for mobile/default state */}
            <button
              disabled={!product.inStock}
              onClick={(e) => {
                e.preventDefault();
              }}
              className="md:hidden bg-maroon/10 text-maroon w-10 h-10 rounded-full flex items-center justify-center hover:bg-maroon hover:text-white transition-colors disabled:opacity-50">
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
