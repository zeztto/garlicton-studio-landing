'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Script from 'next/script'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const SERVICE_KEYS = ['recording', 'mixing', 'mastering', 'producing'] as const

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: object) => string
      getResponse: (widgetId?: string) => string | undefined
      reset: (widgetId?: string) => void
    }
    onTurnstileLoaded?: () => void
  }
}

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations('contact')

  const [formState, setFormState] = useState<FormState>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [genre, setGenre] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileRendered = useRef(false)

  const renderTurnstile = () => {
    if (turnstileRendered.current) return
    if (!turnstileContainerRef.current) return
    if (!window.turnstile) return

    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      callback: (token: string) => {
        setTurnstileToken(token)
      },
      'expired-callback': () => {
        setTurnstileToken('')
      },
      theme: 'dark',
    })
    turnstileRendered.current = true
  }

  useEffect(() => {
    // If Turnstile script already loaded before component mount
    if (window.turnstile) {
      renderTurnstile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          services: selectedServices,
          genre,
          message,
          turnstileToken,
          website,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setFormState('success')
        // Reset form
        setName('')
        setEmail('')
        setPhone('')
        setSelectedServices([])
        setGenre('')
        setMessage('')
        setTurnstileToken('')
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current)
        }
      } else {
        setFormState('error')
        setErrorMsg(data.error || t('error'))
      }
    } catch {
      setFormState('error')
      setErrorMsg(t('error'))
    }
  }

  const inputClass =
    'w-full bg-[#1A1A1A] border border-white/10 rounded-md px-4 py-3 text-[#F0F0F0] placeholder-[#AAAAAA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all duration-200'
  const fontFamily =
    locale === 'ko' ? 'var(--font-noto-sans-kr)' : 'var(--font-inter)'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" style={{ fontFamily }}>
      {/* Honeypot — hidden from real users */}
      <div className="opacity-0 absolute pointer-events-none" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]" htmlFor="contact-name">
          {t('name')} <span className="text-[#8B0000]">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder={t('name')}
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]" htmlFor="contact-email">
          {t('email')} <span className="text-[#8B0000]">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="email@example.com"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]" htmlFor="contact-phone">
          {t('phone')}
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="010-0000-0000"
        />
      </div>

      {/* Services checkboxes */}
      <div className="flex flex-col gap-3">
        <p className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]">{t('services')}</p>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  selectedServices.includes(key)
                    ? 'bg-[#8B0000] border-[#8B0000]'
                    : 'border-white/20 group-hover:border-white/40'
                }`}
                onClick={() => toggleService(key)}
              >
                {selectedServices.includes(key) && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 10 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1,4 3.5,6.5 9,1" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedServices.includes(key)}
                onChange={() => toggleService(key)}
              />
              <span className="text-sm text-[#FFFFFFB3]">{t(key)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]" htmlFor="contact-genre">
          {t('genre')}
        </label>
        <input
          id="contact-genre"
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className={inputClass}
          placeholder={locale === 'ko' ? 'Heavy Metal, Thrash Metal...' : 'Heavy Metal, Thrash Metal...'}
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#AAAAAA]" htmlFor="contact-message">
          {t('message')} <span className="text-[#8B0000]">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder={t('messagePlaceholder')}
        />
      </div>

      {/* Turnstile widget */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={renderTurnstile}
      />
      <div ref={turnstileContainerRef} className="cf-turnstile" />

      {/* Submit */}
      <button
        type="submit"
        disabled={formState === 'loading'}
        className="mt-2 flex items-center justify-center gap-3 px-8 py-4 bg-[#8B0000] text-[#F0F0F0] text-[13px] tracking-[0.2em] uppercase font-medium rounded-md hover:bg-[#A30000] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {formState === 'loading' && (
          <svg
            className="animate-spin w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12h0a12 12 0 010 24h0"
            />
          </svg>
        )}
        {t('submit')}
      </button>

      {/* Toast messages */}
      {formState === 'success' && (
        <div className="flex items-start gap-3 p-4 bg-green-900/30 border border-green-700/40 rounded-md text-green-300 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p style={{ fontFamily }}>{t('success')}</p>
        </div>
      )}

      {formState === 'error' && (
        <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-700/40 rounded-md text-red-300 text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p style={{ fontFamily }}>{errorMsg || t('error')}</p>
        </div>
      )}
    </form>
  )
}
