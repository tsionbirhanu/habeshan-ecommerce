"use client";

import { useState, useEffect, use } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCategoryBySlug, getProductsByFilters } from "@/lib/mock-data";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  FilterSidebar,
  FilterState,
} from "@/components/products/FilterSidebar";
import { SortBar } from "@/components/products/SortBar";
import { Pagination } from "@/components/products/Pagination";
import { CategoryHero } from "@/components/products/CategoryHero";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function CategoryContent({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const category = getCategoryBySlug(slug);

  const [filters, setFilters] = useState<FilterState>({
    categoryId: category?.id,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  if (!category) {
    notFound();
  }

  // Initialize filters from URL params
  useEffect(() => {
    const newFilters: FilterState = {
      categoryId: category.id,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      rating: searchParams.get("rating")
        ? parseInt(searchParams.get("rating")!)
        : undefined,
      inStockOnly: searchParams.get("inStockOnly") === "true",
    };
    setFilters(newFilters);
    setSortBy(searchParams.get("sortBy") || "createdAt");
    setPage(parseInt(searchParams.get("page") || "1"));
  }, [searchParams, category.id]);

  // Update URL when filters change
  const updateURL = (
    newFilters: FilterState,
    newSortBy: string,
    newPage: number,
  ) => {
    const params = new URLSearchParams();
    if (newFilters.minPrice !== undefined)
      params.set("minPrice", newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined)
      params.set("maxPrice", newFilters.maxPrice.toString());
    if (newFilters.rating !== undefined)
      params.set("rating", newFilters.rating.toString());
    if (newFilters.inStockOnly) params.set("inStockOnly", "true");
    if (newSortBy !== "createdAt") params.set("sortBy", newSortBy);
    if (newPage !== 1) params.set("page", newPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState({}, "", `/categories/${slug}${newUrl}`);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    const filtersWithCategory = { ...newFilters, categoryId: category.id };
    setFilters(filtersWithCategory);
    setPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
    updateURL(filtersWithCategory, sortBy, 1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
    updateURL(filters, newSortBy, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
    updateURL(filters, sortBy, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get filtered products
  const { products, total } = getProductsByFilters({
    ...filters,
    sortBy,
    page,
    limit: 20,
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Hero */}
        <CategoryHero
          name={category.name}
          image={category.image}
          description={category.description}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <FilterSidebar
            onFilterChange={handleFilterChange}
            currentFilters={filters}
            productCount={total}
          />

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Sort Bar */}
            <SortBar
              currentPage={page}
              pageSize={20}
              totalCount={total}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Product Grid/List */}
            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  isListView={viewMode === "list"}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to find what you're looking for
                </p>
                <button
                  onClick={() => {
                    setFilters({ categoryId: category.id });
                    setSortBy("createdAt");
                    setPage(1);
                    updateURL({ categoryId: category.id }, "createdAt", 1);
                  }}
                  className="px-6 py-3 bg-maroon text-white font-semibold rounded-lg hover:bg-maroon-dark transition">
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Mobile */}
          <FilterSidebar
            onFilterChange={handleFilterChange}
            currentFilters={filters}
            productCount={total}
            isMobile
          />
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage(props: CategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/50 py-8 flex items-center justify-center">
          Loading category...
        </div>
      }>
      <CategoryContent {...props} />
    </Suspense>
  );
}
