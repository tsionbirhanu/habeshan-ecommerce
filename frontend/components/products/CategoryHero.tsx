"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryHeroProps {
  name: string;
  image: string;
  description?: string;
}

export function CategoryHero({ name, image, description }: CategoryHeroProps) {
  return (
    <div className="space-y-6 mb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-600 hover:text-maroon transition">
          Home
        </Link>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-maroon font-semibold">{name}</span>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
        <Image src={image} alt={name} fill className="object-cover" />

        {/* Maroon Tint Overlay */}
        <div className="absolute inset-0 bg-maroon/30 mix-blend-multiply" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-lg">
              {name}
            </h1>
            {description && (
              <p className="text-lg text-white/90 drop-shadow-md">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
