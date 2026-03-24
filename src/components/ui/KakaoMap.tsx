'use client'

import { useEffect, useRef, useState } from 'react'

// Approximate coordinates for Ganghwa-eup area (인천 강화군 강화읍 북문길67번길 8-1)
const LAT = 37.752179
const LNG = 126.483050

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

export function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)
  const [error, setError] = useState(false)

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
          center: new window.kakao!.maps.LatLng(LAT, LNG),
          level: 4,
        })
        const marker = new window.kakao!.maps.Marker({
          position: new window.kakao!.maps.LatLng(LAT, LNG),
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
  }, [])

  if (error) {
    return (
      <div className="w-full mt-6 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center" style={{ height: '300px', background: '#1A1A1A' }}>
        <a
          href={`https://map.kakao.com/link/map/갈릭톤스튜디오,${LAT},${LNG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#CCCCCC] text-sm hover:text-white transition-colors underline"
        >
          카카오맵에서 보기
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
