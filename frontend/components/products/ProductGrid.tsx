"use client";

import { MockProduct } from "@/lib/mock-data";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: MockProduct[];
  isLoading?: boolean;
  isListView?: boolean;
}

function ProductSkeleton({ isListView = false }: { isListView?: boolean }) {
  if (isListView) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex gap-6 animate-pulse">
        <div className="w-40 h-40 flex-shrink-0 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="flex gap-2 mt-auto pt-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse flex flex-col">
      <div className="relative aspect-[4/5] bg-gray-200" />
      <div className="p-5 space-y-4">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="flex justify-between pt-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading = false,
  isListView = false,
}: ProductGridProps) {
  if (isListView) {
    return (
      <div className="space-y-4">
        {isLoading
          ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} isListView />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} isListView />
            ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {isLoading
        ? [...Array(12)].map((_, i) => <ProductSkeleton key={i} />)
        : products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
    </div>
  );
}
