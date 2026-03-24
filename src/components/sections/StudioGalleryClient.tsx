'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox } from '@/components/ui/Lightbox'

interface GalleryImage {
  src: string
  alt: string
  width?: number
  height?: number
}

interface StudioGalleryClientProps {
  images: GalleryImage[]
}

export function StudioGalleryClient({ images }: StudioGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      {/* Masonry-style grid using CSS columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((img, index) => (
          <button
            key={index}
            className="block w-full break-inside-avoid cursor-pointer overflow-hidden group focus:outline-none"
            onClick={() => setLightboxIndex(index)}
            aria-label={`View image: ${img.alt || String(index + 1)}`}
          >
            <div className="relative overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width ?? 800}
                height={img.height ?? 600}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
            {img.alt && (
              <p
                className="mt-2 text-[11px] text-[#AAAAAA] tracking-wider text-left px-0.5"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {img.alt}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
