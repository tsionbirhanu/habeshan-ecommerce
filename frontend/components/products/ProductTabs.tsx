"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Review, ProductDetail } from "@/lib/mock-data";
import { t } from "@/lib/i18n/translations";

interface ProductTabsProps {
  product: ProductDetail;
  reviews: Review[];
  language: "en" | "de" | "am";
}

function RatingOverview({
  reviews,
  language,
}: {
  reviews: Review[];
  language: "en" | "de" | "am";
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{t("product.noReviews", language)}</p>
        <p className="text-gray-500 text-sm">
          {t("product.beFirstToReview", language)}
        </p>
      </div>
    );
  }

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: Math.round(
      (reviews.filter((r) => r.rating === rating).length / reviews.length) *
        100,
    ),
  }));

  return (
    <div className="mb-12 pb-12 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-maroon mb-2">{avgRating}</div>
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < Math.round(parseFloat(avgRating))
                    ? "text-gold fill-gold"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {reviews.length}{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-24">
                <span className="text-sm font-medium text-gray-700">
                  {rating}★
                </span>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-maroon rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-sm text-gray-500 min-w-12 text-right">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  language,
}: {
  review: Review;
  language: "en" | "de" | "am";
}) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);

  return (
    <div className="p-6 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < review.rating ? "text-gold fill-gold" : "text-gray-300"
                }
              />
            ))}
          </div>
          <h4 className="font-bold text-gray-900">{review.title}</h4>
        </div>
        {review.verified && (
          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
            {t("product.verified", language)}
          </span>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-4">{review.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-900">{review.author}</p>
          <p className="text-xs">
            {new Date(review.date).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          onClick={() => {
            if (!voted) {
              setHelpful(helpful + 1);
              setVoted(true);
            }
          }}
          disabled={voted}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
            voted
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}>
          <ThumbsUp size={16} />
          Helpful ({helpful})
        </button>
      </div>
    </div>
  );
}

export function ProductTabs({ product, reviews, language }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "details" | "reviews"
  >("description");

  const tabs = ["description", "details", "reviews"] as const;

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-1 border-b-2 font-semibold transition capitalize whitespace-nowrap ${
              activeTab === tab
                ? "border-maroon text-maroon"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}>
            {tab === "description" && "Beschreibung"}
            {tab === "details" && "Details"}
            {tab === "reviews" && `Bewertungen (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          </div>
        )}

        {activeTab === "details" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-bold text-maroon bg-gray-50 w-1/3">
                    Weight
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.weight}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-bold text-maroon bg-gray-50">
                    SKU
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.sku}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-bold text-maroon bg-gray-50">
                    Category
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {product.category}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 font-bold text-maroon bg-gray-50">
                    Country
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.country}</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-maroon bg-gray-50">
                    VAT Rate
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.vat}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-8">
            <RatingOverview reviews={reviews} language={language} />

            {reviews.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Customer Reviews
                </h3>
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    language={language}
                  />
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No reviews yet</p>
                <p className="text-gray-500 text-sm">
                  Be the first to review this product
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
