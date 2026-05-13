"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Image */}
      <div className="space-y-4">
        <div
          ref={imageRef}
          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}>
          <Image
            src={images[activeImage]}
            alt={productName}
            fill
            className={`object-cover transition-transform duration-300 ${zoom ? "scale-150" : "scale-100"}`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          />

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={20} className="text-maroon" />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10">
                <ChevronLeft size={20} className="text-maroon" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10">
                <ChevronRight size={20} className="text-maroon" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs font-semibold px-3 py-2 rounded">
              {activeImage + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-square w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                  activeImage === idx
                    ? "border-maroon shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <Image
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition">
            <X size={24} />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-screen flex items-center justify-center px-6">
            <Image
              src={images[activeImage]}
              alt={productName}
              fill
              className="object-contain"
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition z-10">
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition z-10">
                  <ChevronRight size={24} />
                </button>

                {/* Lightbox thumbnails */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-12 h-12 rounded border-2 transition ${
                        activeImage === idx
                          ? "border-gold"
                          : "border-white/30 hover:border-white/60"
                      }`}>
                      <Image
                        src={img}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
