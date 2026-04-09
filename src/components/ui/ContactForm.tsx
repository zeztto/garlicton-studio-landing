'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Script from 'next/script'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const SERVICE_KEYS = ['recording', 'mixing', 'mastering', 'producing'] as const
type ServiceKey = (typeof SERVICE_KEYS)[number]
type CmsSource = Record<string, unknown> | null | undefined

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

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function getServiceOptions(source: CmsSource, locale: string, t: ReturnType<typeof useTranslations>) {
  const configuredArrays = ['serviceOptions', 'servicesOptions', 'formServices', 'servicesList']

  for (const key of configuredArrays) {
    const value = source?.[key]
    if (!Array.isArray(value)) {
      continue
    }

    const options = value
      .map((item) => {
        const record = getRecord(item)
        if (!record) {
          return null
        }

        const rawValue = getStringValue(record, ['value', 'key', 'slug'])
        if (!SERVICE_KEYS.includes(rawValue as ServiceKey)) {
          return null
        }

        return {
          value: rawValue as ServiceKey,
          label: getLocalizedValue(record, ['label', 'name', 'title'], locale, t(rawValue)),
        }
      })
      .filter((item): item is { value: ServiceKey; label: string } => item !== null)

    if (options.length > 0) {
      return options
    }
  }

  return SERVICE_KEYS.map((key) => ({
    value: key,
    label: getLocalizedValue(
      source,
      [`service${key.charAt(0).toUpperCase()}${key.slice(1)}Label`, `${key}Label`, key],
      locale,
      t(key),
    ),
  }))
}

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

export function ContactForm({
  locale,
  settings,
}: {
  locale: string
  settings?: Record<string, unknown> | null
}) {
  const t = useTranslations('contact')
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? ''

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

  const nameLabel = getLocalizedValue(settings, ['formNameLabel', 'nameLabel', 'name'], locale, t('name'))
  const namePlaceholder = getLocalizedValue(
    settings,
    ['formNamePlaceholder', 'namePlaceholder'],
    locale,
    nameLabel,
  )
  const emailLabel = getLocalizedValue(settings, ['formEmailLabel', 'emailLabel', 'email'], locale, t('email'))
  const emailPlaceholder = getLocalizedValue(
    settings,
    ['formEmailPlaceholder', 'emailPlaceholder'],
    locale,
    'email@example.com',
  )
  const phoneLabel = getLocalizedValue(settings, ['formPhoneLabel', 'phoneLabel', 'phone'], locale, t('phone'))
  const phonePlaceholder = getLocalizedValue(
    settings,
    ['formPhonePlaceholder', 'phonePlaceholder'],
    locale,
    '010-0000-0000',
  )
  const servicesLabel = getLocalizedValue(
    settings,
    ['formServicesLabel', 'servicesLabel', 'services'],
    locale,
    t('services'),
  )
  const serviceOptions = getServiceOptions(settings, locale, t)
  const genreLabel = getLocalizedValue(settings, ['formGenreLabel', 'genreLabel', 'genre'], locale, t('genre'))
  const genrePlaceholder = getLocalizedValue(
    settings,
    ['formGenrePlaceholder', 'genrePlaceholder'],
    locale,
    'Heavy Metal, Thrash Metal...',
  )
  const messageLabel = getLocalizedValue(
    settings,
    ['formMessageLabel', 'messageLabel', 'message'],
    locale,
    t('message'),
  )
  const messagePlaceholder = getLocalizedValue(
    settings,
    ['formMessagePlaceholder', 'messagePlaceholder'],
    locale,
    t('messagePlaceholder'),
  )
  const submitLabel = getLocalizedValue(
    settings,
    ['formSubmitLabel', 'submitLabel', 'submit'],
    locale,
    t('submit'),
  )
  const successMessage = getLocalizedValue(
    settings,
    ['formSuccessMessage', 'successMessage', 'success'],
    locale,
    t('success'),
  )
  const errorMessage = getLocalizedValue(
    settings,
    ['formErrorMessage', 'errorMessage', 'error'],
    locale,
    t('error'),
  )

  const renderTurnstile = () => {
    if (turnstileRendered.current) return
    if (!turnstileContainerRef.current) return
    if (!window.turnstile) return
    if (!turnstileSiteKey) return

    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
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
        setErrorMsg(data.error || errorMessage)
      }
    } catch {
      setFormState('error')
      setErrorMsg(errorMessage)
    }
  }

  const inputClass =
    'w-full bg-[#1A1A1A] border border-white/10 rounded-md px-4 py-3 text-[#F0F0F0] placeholder-[#999999] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent transition-all duration-200'
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
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]" htmlFor="contact-name">
          {nameLabel} <span className="text-[#8B0000]">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder={namePlaceholder}
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]" htmlFor="contact-email">
          {emailLabel} <span className="text-[#8B0000]">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder={emailPlaceholder}
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]" htmlFor="contact-phone">
          {phoneLabel}
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d\-+() ]/g, '')
            setPhone(v)
          }}
          pattern="[\d\-+() ]{0,20}"
          className={inputClass}
          placeholder={phonePlaceholder}
        />
      </div>

      {/* Services checkboxes */}
      <div className="flex flex-col gap-3">
        <p className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]">{servicesLabel}</p>
        <div className="grid grid-cols-2 gap-3">
          {serviceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleService(option.value)}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <span
                className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  selectedServices.includes(option.value)
                    ? 'bg-[#8B0000] border-[#8B0000]'
                    : 'border-white/20 group-hover:border-white/40'
                }`}
              >
                {selectedServices.includes(option.value) && (
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
              <span className="text-sm text-[#FFFFFFDD]">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]" htmlFor="contact-genre">
          {genreLabel}
        </label>
        <input
          id="contact-genre"
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className={inputClass}
          placeholder={genrePlaceholder}
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] tracking-[0.15em] uppercase text-[#CCCCCC]" htmlFor="contact-message">
          {messageLabel} <span className="text-[#8B0000]">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder={messagePlaceholder}
        />
      </div>

      {/* Turnstile widget */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={renderTurnstile}
      />
      {turnstileSiteKey ? (
        <div ref={turnstileContainerRef} className="min-h-16" />
      ) : null}

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
        {submitLabel}
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
          <p style={{ fontFamily }}>{successMessage}</p>
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
          <p style={{ fontFamily }}>{errorMsg || errorMessage}</p>
        </div>
      )}
    </form>
  )
}
