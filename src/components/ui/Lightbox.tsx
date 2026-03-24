'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import Image from 'next/image'

interface LightboxImage {
  src: string
  alt: string
  width?: number
  height?: number
}

interface LightboxProps {
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [visible, setVisible] = useState(false)

  // Touch swipe state
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const total = images.length

  const goPrev = useCallback(() => {
    setCurrent((i) => (i - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    setCurrent((i) => (i + 1) % total)
  }, [total])

  const handleClose = useCallback(() => {
    setVisible(false)
    // Wait for fade-out before calling onClose
    setTimeout(onClose, 200)
  }, [onClose])

  // Mount animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleClose, goPrev, goNext])

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only treat as horizontal swipe if horizontal dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const img = images[current]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.92 : 0})`,
        transition: 'background-color 200ms ease',
      }}
      onClick={handleClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        className="absolute top-5 right-5 text-[#AAAAAA] hover:text-[#F0F0F0] transition-colors z-10 p-2"
        onClick={handleClose}
        aria-label="Close"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Image counter */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 text-[12px] tracking-[0.2em] text-[#AAAAAA]"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {current + 1} / {total}
      </div>

      {/* Prev button */}
      {total > 1 && (
        <button
          className="absolute left-4 md:left-8 text-[#AAAAAA] hover:text-[#F0F0F0] transition-colors z-10 p-3"
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          aria-label="Previous image"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {total > 1 && (
        <button
          className="absolute right-4 md:right-8 text-[#AAAAAA] hover:text-[#F0F0F0] transition-colors z-10 p-3"
          onClick={(e) => { e.stopPropagation(); goNext() }}
          aria-label="Next image"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] w-full flex items-center justify-center"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.94)',
          opacity: visible ? 1 : 0,
          transition: 'transform 200ms ease, opacity 200ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current}
          src={img.src}
          alt={img.alt}
          width={img.width ?? 1600}
          height={img.height ?? 900}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
          priority
        />
        {img.alt && (
          <p
            className="absolute -bottom-8 left-0 right-0 text-center text-[11px] tracking-wider text-[#AAAAAA]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {img.alt}
          </p>
        )}
      </div>
    </div>
  )
}
