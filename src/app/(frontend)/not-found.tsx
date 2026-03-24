import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Large 404 */}
      <p
        className="text-[clamp(6rem,20vw,14rem)] font-bold leading-none tracking-tighter text-[#1A1A1A] select-none"
        style={{ fontFamily: 'var(--font-inter)' }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Message */}
      <h1
        className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-light tracking-[0.15em] uppercase text-[#F0F0F0] -mt-4"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Page not found
      </h1>

      {/* Divider */}
      <div className="w-12 h-px bg-white/10 my-8" />

      {/* Sub-text */}
      <p
        className="text-[#888888] font-light text-sm tracking-wider mb-10"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        The page you are looking for does not exist.
      </p>

      {/* Back home link */}
      <Link
        href="/ko"
        className="inline-block px-8 py-3 border border-white/20 text-[13px] tracking-[0.2em] uppercase text-[#F0F0F0] hover:border-white/50 hover:text-white transition-all duration-300"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Back to Home
      </Link>
    </div>
  )
}
