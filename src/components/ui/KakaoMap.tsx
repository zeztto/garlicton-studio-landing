'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

// Approximate coordinates for Ganghwa-eup area (인천 강화군 강화읍 북문길67번길 8-1)
const LAT = 37.7470
const LNG = 126.4870

export function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)

  const initMap = () => {
    if (mapInitialized.current) return
    if (!containerRef.current) return

    const kakao = (window as Window & { kakao?: { maps: { load: (cb: () => void) => void; Map: new (el: HTMLElement, opts: object) => object; LatLng: new (lat: number, lng: number) => object; Marker: new (opts: object) => { setMap: (map: object) => void } }; }; }).kakao
    if (!kakao?.maps) return

    kakao.maps.load(() => {
      if (!containerRef.current) return
      const options = {
        center: new kakao.maps.LatLng(LAT, LNG),
        level: 4,
      }
      const map = new kakao.maps.Map(containerRef.current, options)
      const markerPosition = new kakao.maps.LatLng(LAT, LNG)
      const marker = new kakao.maps.Marker({ position: markerPosition })
      marker.setMap(map)
      mapInitialized.current = true
    })
  }

  useEffect(() => {
    // If SDK already loaded (e.g. hot reload), initialize immediately
    const kakao = (window as Window & { kakao?: { maps?: object } }).kakao
    if (kakao?.maps) {
      initMap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full mt-6">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="lazyOnload"
        onLoad={initMap}
      />
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-white/10"
        style={{ height: '300px', background: '#1A1A1A' }}
      />
    </div>
  )
}
