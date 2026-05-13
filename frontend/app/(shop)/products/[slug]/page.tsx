"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Package } from "lucide-react";
import { ImageGallery } from "@/components/products/ImageGallery";
import { ProductTabs } from "@/components/products/ProductTabs";
import { RelatedProducts } from "@/components/products/RelatedProducts";

import { useLanguage } from "@/lib/i18n/language-context";
import { t, tpl } from "@/lib/i18n/translations";
import { useCartStore } from "@/lib/stores/cart.store";
import { useUIStore } from "@/lib/stores/ui.store";
import { cartAPI } from "@/lib/api/cart.api";
import {
  MOCK_PRODUCTS,
  getProductDetail,
  getProductReviews,
  getRelatedProducts,
} from "@/lib/mock-data";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function StockIndicator({
  stock,
  inStock,
  language,
}: {
  stock: number;
  inStock: boolean;
  language: "en" | "de" | "am";
}) {
  if (!inStock) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="font-semibold text-red-600">
          {t("product.outOfStock", language)}
        </span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span className="font-semibold text-orange-600">
          {tpl("product.limitedStock", language, { count: stock })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-green-500" />
      <span className="font-semibold text-green-600">
        {t("product.inStock", language)} ({stock}{" "}
        {t("product.inStockCount", language)})
      </span>
    </div>
  );
}

function DeliveryInfo({
  shippingTime,
  shippingCost,
  freeShippingThreshold,
  returnDays,
  price,
  language,
}: {
  shippingTime: string;
  shippingCost: number;
  freeShippingThreshold: number;
  returnDays: number;
  price: number;
  language: "en" | "de" | "am";
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isFreeShipping = price >= freeShippingThreshold;

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition font-semibold text-gray-900">
        <span className="flex items-center gap-2">
          <Package size={20} className="text-maroon" />
          {t("product.shipping", language)}
        </span>
        <span className="text-2xl">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 text-sm border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {t("product.shippingTime", language)}:
            </span>
            <span className="font-semibold text-gray-900">
              {tpl("product.shippingTime", language, { time: shippingTime })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">
              {t("product.shippingCost", language)}:
            </span>
            <span className="font-semibold text-gray-900">
              {isFreeShipping ? (
                <span className="text-green-600">
                  {t("product.shipping.free", language)}
                </span>
              ) : (
                `€${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>

          {!isFreeShipping && (
            <div className="text-xs text-gray-500">
              {t("product.freeShippingFrom", language)} €
              {freeShippingThreshold.toFixed(2)}
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="text-gray-600">
              {t("product.returnDays", language)}:
            </span>
            <span className="font-semibold text-gray-900">
              {tpl("product.returnDaysText", language, { days: returnDays })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { language } = useLanguage();
  const cartStore = useCartStore();
  const { addToast } = useUIStore();
  const [wishlist, setWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Unwrap the params promise
  const { slug } = use(params);

  // Find product by slug
  const baseProduct = MOCK_PRODUCTS.find(
    (p) =>
      p.name.toLowerCase().replace(/\s+/g, "-").includes(slug.toLowerCase()) ||
      slug.includes(p.id),
  );

  if (!baseProduct) {
    notFound();
  }

  const product = getProductDetail(baseProduct.id);
  if (!product) {
    notFound();
  }

  const reviews = getProductReviews(product.id);
  const relatedProducts = getRelatedProducts(product.id, 4);

  const handleAddToCart = async (qty: number) => {
    try {
      setIsAddingToCart(true);

      // Add to local store
      const timestamp = new Date().getTime();
      cartStore.addItem({
        id: `${product.id}-${timestamp}`,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        image: product.images[0],
      });

      // Call API
      try {
        await cartAPI.addToCart({
          productId: product.id,
          quantity: qty,
        });
      } catch (apiError) {
        console.warn(
          "API call failed, but item added to local cart:",
          apiError,
        );
      }

      // Show success toast
      addToast({
        message: t("product.addedToCart", language),
        type: "success",
      });

      // Reset quantity
      setQuantity(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      addToast({
        message:
          error instanceof Error
            ? error.message
            : "Fehler beim Hinzufügen zum Warenkorb",
        type: "error",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8 text-gray-600">
            <Link href="/" className="hover:text-maroon transition">
              {t("product.breadcrumb.home", language)}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-maroon transition">
              {t("product.breadcrumb.products", language)}
            </Link>
            <span>/</span>
            <Link
              href={`/categories/${product.categoryId}`}
              className="hover:text-maroon transition">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Left column: Image Gallery (55%) */}
            <div className="lg:col-span-2">
              <ImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Right column: Product Info (45%) */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div>
                <Link
                  href={`/categories/${product.categoryId}`}
                  className="inline-block px-4 py-2 bg-maroon/10 text-maroon font-semibold rounded-full text-sm hover:bg-maroon/20 transition">
                  {product.category}
                </Link>
              </div>

              {/* Product Name */}
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(product.rating)
                          ? "text-gold fill-gold"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">
                  {product.rating.toFixed(1)} ({product.reviewCount}{" "}
                  {t("product.tabReviews", language)})
                </span>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-4">
                  {hasDiscount && product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-4xl font-bold font-serif text-maroon">
                    €{product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {tpl("product.includesTax", language, {
                    tax: product.vat,
                  })}
                </p>
              </div>

              {/* Stock Indicator */}
              <div className="py-4 border-y border-gray-200">
                <StockIndicator
                  stock={product.stock ?? 0}
                  inStock={product.inStock}
                  language={language}
                />
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-3 block">
                    {t("product.quantity", language)}
                  </label>
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-gray-700">
                        −
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= (product.stock ?? 0)}
                        className="px-4 py-3 hover:bg-gray-100 transition font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(quantity)}
                  disabled={!product.inStock || isAddingToCart}
                  className="w-full py-4 bg-maroon text-white font-bold text-lg rounded-lg hover:bg-maroon-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                  <ShoppingCart size={24} />
                  {isAddingToCart ? "..." : t("product.addToCart", language)}
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className="w-full py-3 border-2 border-gray-300 text-gray-900 font-bold rounded-lg hover:border-maroon hover:text-maroon transition flex items-center justify-center gap-2">
                  <Heart size={20} fill={wishlist ? "currentColor" : "none"} />
                  {t("product.wishlist", language)}
                </button>
              </div>

              {/* Product Specs Row */}
              <div className="grid grid-cols-4 gap-3 py-4 px-4 bg-gray-50 rounded-lg text-center text-sm">
                <div>
                  <p className="font-bold text-gray-900">{product.weight}</p>
                  <p className="text-gray-600 text-xs">
                    {t("product.weight", language)}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{product.vat}%</p>
                  <p className="text-gray-600 text-xs">
                    {t("product.vat", language)}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 truncate">
                    {product.sku}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {t("product.sku", language)}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{product.country}</p>
                  <p className="text-gray-600 text-xs">
                    {t("product.country", language)}
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <DeliveryInfo
                shippingTime={product.shippingTime}
                shippingCost={product.shippingCost}
                freeShippingThreshold={product.freeShippingThreshold}
                returnDays={product.returnDays}
                price={product.price}
                language={language}
              />
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mb-16 py-8 border-t border-gray-200">
            <ProductTabs
              product={product}
              reviews={reviews}
              language={language}
            />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </div>
    </>
  );
}
