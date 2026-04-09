'use client'

import { useEffect, useRef, useState } from 'react'

// Approximate coordinates for Ganghwa-eup area (인천 강화군 강화읍 북문길67번길 8-1)
const LAT = 37.752179
const LNG = 126.483050
type CmsSource = Record<string, unknown> | null | undefined

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function getStringValue(source: CmsSource, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

function getLocalizedValue(
  source: CmsSource,
  keys: string[],
  locale: string,
  fallback: string,
): string {
  const suffix = locale === 'ko' ? 'ko' : 'en'

  for (const key of keys) {
    const localizedValue = source?.[`${key}_${suffix}`]
    if (typeof localizedValue === 'string' && localizedValue.trim()) {
      return localizedValue.trim()
    }

    const plainValue = source?.[key]
    if (typeof plainValue === 'string' && plainValue.trim()) {
      return plainValue.trim()
    }
  }

  return fallback
}

function getNumberValue(source: CmsSource, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return fallback
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void
        Map: new (el: HTMLElement, opts: object) => object
        LatLng: new (lat: number, lng: number) => object
        Marker: new (opts: object) => { setMap: (map: object) => void }
      }
    }
  }
}

export function KakaoMap({
  locale,
  settings,
}: {
  locale: string
  settings?: Record<string, unknown> | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)
  const [error, setError] = useState(false)
  const mapSettings = getRecord(settings?.map) ?? settings
  const latitude = getNumberValue(mapSettings, ['mapLatitude', 'kakaoMapLat', 'mapLat', 'latitude', 'lat'], LAT)
  const longitude = getNumberValue(mapSettings, ['mapLongitude', 'kakaoMapLng', 'mapLng', 'longitude', 'lng'], LNG)
  const placeName = getLocalizedValue(
    mapSettings,
    ['kakaoMapPlaceName', 'mapPlaceName', 'placeName'],
    locale,
    locale === 'ko' ? '갈릭톤 스튜디오' : 'Garlicton Studio',
  )
  const fallbackLabel = getLocalizedValue(
    mapSettings,
    ['kakaoMapFallbackLabel', 'mapFallbackLabel', 'mapLinkLabel'],
    locale,
    locale === 'ko' ? '카카오맵에서 보기' : 'View on Kakao Map',
  )
  const mapLevel = getNumberValue(mapSettings, ['kakaoMapLevel', 'mapLevel', 'zoomLevel'], 4)
  const mapLink = `https://map.kakao.com/link/map/${encodeURIComponent(placeName)},${latitude},${longitude}`

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
    if (!appKey) {
      setError(true)
      return
    }

    // Load Kakao Map SDK
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
    script.async = true
    script.onload = () => {
      if (!window.kakao?.maps) return
      window.kakao.maps.load(() => {
        if (!containerRef.current || mapInitialized.current) return
        const map = new window.kakao!.maps.Map(containerRef.current, {
          center: new window.kakao!.maps.LatLng(latitude, longitude),
          level: mapLevel,
        })
        const marker = new window.kakao!.maps.Marker({
          position: new window.kakao!.maps.LatLng(latitude, longitude),
          title: placeName,
        })
        marker.setMap(map)
        mapInitialized.current = true
      })
    }
    script.onerror = () => setError(true)
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [latitude, longitude, mapLevel, placeName])

  if (error) {
    return (
      <div className="w-full mt-6 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center" style={{ height: '300px', background: '#1A1A1A' }}>
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#CCCCCC] text-sm hover:text-white transition-colors underline"
        >
          {fallbackLabel}
        </a>
      </div>
    )
  }

  return (
    <div className="w-full mt-6">
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-white/10"
        style={{ height: '300px', background: '#1A1A1A' }}
      />
    </div>
  )
}
