"use client";

import { useState } from "react";
import { X, Filter } from "lucide-react";
import { MOCK_CATEGORIES, getPriceRange } from "@/lib/mock-data";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
  productCount: number;
  isMobile?: boolean;
}

export interface FilterState {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
}

export function FilterSidebar({
  onFilterChange,
  currentFilters,
  productCount,
  isMobile = false,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const priceRange = getPriceRange();

  // Count products by category (simplified mock)
  const categoryCounts = {
    "1": 24,
    "2": 18,
    "3": 15,
    "4": 20,
    "5": 32,
  };

  const handleCategoryToggle = (categoryId: string) => {
    onFilterChange({
      ...currentFilters,
      categoryId:
        currentFilters.categoryId === categoryId ? undefined : categoryId,
    });
  };

  const handlePriceRangeChange = (type: "min" | "max", value: number) => {
    onFilterChange({
      ...currentFilters,
      minPrice: type === "min" ? value : currentFilters.minPrice,
      maxPrice: type === "max" ? value : currentFilters.maxPrice,
    });
  };

  const handleRatingFilter = (rating: number) => {
    onFilterChange({
      ...currentFilters,
      rating: currentFilters.rating === rating ? undefined : rating,
    });
  };

  const handleStockToggle = () => {
    onFilterChange({
      ...currentFilters,
      inStockOnly: !currentFilters.inStockOnly,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    currentFilters.categoryId ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.rating ||
    currentFilters.inStockOnly;

  const content = (
    <div className="space-y-8">
      {/* Applied Filters */}
      {hasActiveFilters && (
        <div className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              {t("filter.appliedFilters", language)}
            </h4>
            <button
              onClick={clearAllFilters}
              className="text-xs text-maroon hover:text-maroon-dark font-semibold uppercase tracking-wide transition">
              {t("filter.clearAll", language)}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentFilters.categoryId && (
              <div className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-semibold">
                {
                  MOCK_CATEGORIES.find(
                    (c) => c.id === currentFilters.categoryId,
                  )?.name
                }
                <button
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      categoryId: undefined,
                    })
                  }
                  className="hover:text-maroon-dark">
                  <X size={14} />
                </button>
              </div>
            )}
            {currentFilters.minPrice && (
              <div className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-semibold">
                €{currentFilters.minPrice}+
                <button
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      minPrice: undefined,
                    })
                  }
                  className="hover:text-maroon-dark">
                  <X size={14} />
                </button>
              </div>
            )}
            {currentFilters.maxPrice && (
              <div className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-semibold">
                €{currentFilters.maxPrice}-
                <button
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      maxPrice: undefined,
                    })
                  }
                  className="hover:text-maroon-dark">
                  <X size={14} />
                </button>
              </div>
            )}
            {currentFilters.rating && (
              <div className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-semibold">
                {currentFilters.rating}★+
                <button
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      rating: undefined,
                    })
                  }
                  className="hover:text-maroon-dark">
                  <X size={14} />
                </button>
              </div>
            )}
            {currentFilters.inStockOnly && (
              <div className="inline-flex items-center gap-2 bg-maroon/10 text-maroon px-3 py-1.5 rounded-full text-xs font-semibold">
                {t("filter.inStock", language)}
                <button
                  onClick={() =>
                    onFilterChange({
                      ...currentFilters,
                      inStockOnly: false,
                    })
                  }
                  className="hover:text-maroon-dark">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          {t("filter.categories", language)}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!currentFilters.categoryId}
              onChange={() => handleCategoryToggle("")}
              className="w-4 h-4 rounded border-gray-300 text-maroon cursor-pointer accent-maroon"
            />
            <span className="text-sm font-medium text-gray-700">
              {t("filter.allCategories", language)}
            </span>
          </label>
          {MOCK_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={currentFilters.categoryId === cat.id}
                onChange={() => handleCategoryToggle(cat.id)}
                className="w-4 h-4 rounded border-gray-300 text-maroon cursor-pointer accent-maroon"
              />
              <span className="text-sm text-gray-700 group-hover:text-maroon transition flex-1">
                {cat.name}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-maroon/10 transition">
                {categoryCounts[cat.id as keyof typeof categoryCounts] || 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          {t("filter.priceRange", language)}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {t("filter.minPrice", language)} (€)
            </label>
            <input
              type="number"
              min={Math.floor(priceRange.min)}
              max={Math.floor(priceRange.max)}
              value={currentFilters.minPrice || Math.floor(priceRange.min)}
              onChange={(e) =>
                handlePriceRangeChange("min", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              {t("filter.maxPrice", language)} (€)
            </label>
            <input
              type="number"
              min={Math.floor(priceRange.min)}
              max={Math.floor(priceRange.max)}
              value={currentFilters.maxPrice || Math.floor(priceRange.max)}
              onChange={(e) =>
                handlePriceRangeChange("max", parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-maroon focus:border-transparent"
            />
          </div>
          <div className="text-xs text-gray-500 text-center pt-2">
            €{currentFilters.minPrice || Math.floor(priceRange.min)} - €
            {currentFilters.maxPrice || Math.floor(priceRange.max)}
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          {t("filter.rating", language)}
        </h3>
        <div className="space-y-3">
          {[5, 4, 3].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={currentFilters.rating === rating}
                onChange={() => handleRatingFilter(rating)}
                className="w-4 h-4 rounded border-gray-300 text-maroon cursor-pointer accent-maroon"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${i < rating ? "text-gold" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-700 group-hover:text-maroon transition ml-1">
                  {rating} {t("filter.starsAndUp", language)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
          {t("filter.availability", language)}
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={currentFilters.inStockOnly || false}
            onChange={handleStockToggle}
            className="w-4 h-4 rounded border-gray-300 text-maroon cursor-pointer accent-maroon"
          />
          <span className="text-sm text-gray-700 group-hover:text-maroon transition">
            {t("filter.inStockOnly", language)}
          </span>
        </label>
      </div>
    </div>
  );

  // Mobile Filter Modal
  if (isMobile) {
    return (
      <>
        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 right-6 md:hidden flex items-center justify-center gap-2 bg-maroon text-white py-4 font-bold rounded-lg z-40 shadow-lg">
          <Filter size={20} />
          {t("filter.filters", language)}
        </button>

        {/* Modal */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 md:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto z-50 md:hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="font-bold text-lg">{t("filter.filters", language)}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">{content}</div>
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-maroon font-bold border-2 border-maroon rounded-lg hover:bg-maroon/5 transition uppercase">
                  {t("filter.close", language)}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="flex-1 py-3 bg-maroon text-white font-bold rounded-lg hover:bg-maroon-dark transition uppercase">
                  {t("filter.apply", language)}
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="hidden md:block bg-white rounded-xl p-6 border border-gray-100 h-fit sticky top-24">
      {content}
    </div>
  );
}
