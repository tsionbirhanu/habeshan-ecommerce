import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  alt = "Product",
}) => {
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const handleNext = () => {
    setMainImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setMainImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in group"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}>
        <img
          src={images[mainImageIdx]}
          alt={alt}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            zoomed ? "scale-150" : "scale-100"
          }`}
        />

        {zoomed && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <ZoomIn className="text-white opacity-70" size={32} />
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-10">
              <ChevronLeft size={20} className="text-maroon" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-10">
              <ChevronRight size={20} className="text-maroon" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setMainImageIdx(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                mainImageIdx === idx
                  ? "border-maroon"
                  : "border-gray-200 hover:border-maroon/50"
              }`}>
              <img
                src={img}
                alt={`${alt} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
