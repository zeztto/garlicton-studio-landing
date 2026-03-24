interface MediaEmbedProps {
  mediaType: 'youtube' | 'soundcloud' | 'spotify'
  embedUrl: string
  title?: string
}

function extractYouTubeId(url: string): string | null {
  // Handles:
  //   https://youtu.be/VIDEO_ID
  //   https://youtu.be/VIDEO_ID?list=PLAYLIST
  //   https://www.youtube.com/watch?v=VIDEO_ID
  //   https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0]
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v')
    }
  } catch {
    // Not a valid URL — try a simple regex fallback
    const match = url.match(/(?:youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/)
    if (match) return match[1]
  }
  return null
}

export function MediaEmbed({ mediaType, embedUrl, title = '' }: MediaEmbedProps) {
  let src: string | null = null

  if (mediaType === 'youtube') {
    const videoId = extractYouTubeId(embedUrl)
    if (videoId) {
      src = `https://www.youtube.com/embed/${videoId}`
    }
  } else if (mediaType === 'soundcloud') {
    // Accept either a SoundCloud page URL or a ready-made embed URL
    if (embedUrl.includes('w.soundcloud.com')) {
      src = embedUrl
    } else {
      src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedUrl)}&color=%238B0000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
    }
  } else if (mediaType === 'spotify') {
    // Convert open.spotify.com URLs to embed.spotify.com
    src = embedUrl.replace('open.spotify.com', 'embed.spotify.com')
  }

  if (!src) {
    return (
      <div
        className="w-full aspect-video flex items-center justify-center bg-[#1A1A1A] text-[#AAAAAA] text-sm"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Invalid media URL
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  )
}
