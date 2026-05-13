"use client";

import { Grid3x3, List } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { t } from "@/lib/i18n/translations";

interface SortBarProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function SortBar({
  currentPage,
  pageSize,
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SortBarProps) {
  const { language } = useLanguage();
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const sortOptions = [
    { value: "createdAt", label: t("sort.latest", language) },
    { value: "popular", label: t("sort.bestSellers", language) },
    { value: "price-asc", label: t("sort.priceLowHigh", language) },
    { value: "price-desc", label: t("sort.priceHighLow", language) },
    { value: "rating", label: t("sort.topRated", language) },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">
          {t("sort.showing", language)} {startItem}-{endItem}
        </span>{" "}
        {t("sort.of", language)} <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
        {t("sort.products", language)}
      </div>

      {/* Sort & View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-semibold text-gray-600 hidden sm:block">
            {t("sort.sortBy", language)}:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="flex-1 sm:flex-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-maroon focus:border-transparent cursor-pointer hover:border-gray-400 transition">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit ml-auto sm:ml-0">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2.5 rounded transition ${
              viewMode === "grid"
                ? "bg-white text-maroon shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title={t("sort.gridView", language)}>
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2.5 rounded transition ${
              viewMode === "list"
                ? "bg-white text-maroon shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title={t("sort.listView", language)}>
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
