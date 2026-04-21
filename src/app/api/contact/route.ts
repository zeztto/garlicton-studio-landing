import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'
import {
  createApiRequestContext,
  createErrorResponse,
  createSuccessResponse,
  getErrorSummary,
  logApiEvent,
} from '@/lib/api-runtime'
import { shouldAcknowledgeContactSubmission } from '@/lib/contact-delivery'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getPayloadClient } from '@/lib/payload'

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5
const ALLOWED_SERVICE_VALUES = ['recording', 'mixing', 'mastering', 'producing'] as const

type AllowedService = (typeof ALLOWED_SERVICE_VALUES)[number]

const ALLOWED_SERVICE_SET = new Set<AllowedService>(ALLOWED_SERVICE_VALUES)

type RateLimitEntry = {
  count: number
  resetAt: number
}

declare global {
  var __garlictonContactRateLimitStore: Map<string, RateLimitEntry> | undefined
}

export async function POST(req: NextRequest) {
  const context = createApiRequestContext(req, 'contact.submit')
  const clientIp = context.clientIp
  const rateLimit = consumeRateLimitToken(clientIp)
  if (!rateLimit.ok) {
    logApiEvent('warn', context, 'contact.rate_limited', {
      retryAfterMs: rateLimit.retryAfterMs,
    })

    return createErrorResponse(
      context,
      {
        code: 'contact_rate_limited',
        message: 'Too many contact attempts. Please try again later.',
        status: 429,
      },
      {
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    logApiEvent('warn', context, 'contact.invalid_json')
    return createErrorResponse(context, {
      code: 'invalid_json',
      message: 'Invalid request body',
      status: 400,
    })
  }

  const { name, email, phone, services, genre, message, turnstileToken, website } = body as {
    name?: string
    email?: string
    phone?: string
    services?: string[]
    genre?: string
    message?: string
    turnstileToken?: string
    website?: string
  }

  // Honeypot: bots fill the hidden website field — return success silently
  if (website) {
    logApiEvent('info', context, 'contact.honeypot_triggered')
    return createSuccessResponse(context)
  }

  const normalizedName = typeof name === 'string' ? name.trim() : ''
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
  const normalizedGenre = typeof genre === 'string' ? genre.trim() : ''
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  const normalizedServices = Array.isArray(services)
    ? services.filter(isAllowedService)
    : []
  const captchaRequired = process.env.NODE_ENV === 'production'
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim()

  // Validate required fields
  if (!normalizedName || !normalizedEmail || !normalizedMessage) {
    logApiEvent('warn', context, 'contact.validation_failed', {
      reason: 'missing_required_fields',
    })
    return createErrorResponse(context, {
      code: 'contact_validation_error',
      message: 'Name, email, and message are required.',
      status: 400,
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    logApiEvent('warn', context, 'contact.validation_failed', {
      reason: 'invalid_email',
    })
    return createErrorResponse(context, {
      code: 'contact_validation_error',
      message: 'Invalid email address.',
      status: 400,
    })
  }

  // Validate phone format (optional, but if provided must be digits/dashes/spaces/parens/plus only)
  if (normalizedPhone && !/^[\d\-+() ]{4,20}$/.test(normalizedPhone)) {
    logApiEvent('warn', context, 'contact.validation_failed', {
      reason: 'invalid_phone',
    })
    return createErrorResponse(context, {
      code: 'contact_validation_error',
      message: 'Invalid phone number format.',
      status: 400,
    })
  }

  if (captchaRequired && !turnstileSecret) {
    logApiEvent('error', context, 'contact.turnstile_not_configured')
    return createErrorResponse(context, {
      code: 'contact_temporarily_unavailable',
      message: 'Contact form is temporarily unavailable.',
      status: 503,
    })
  }

  // Verify Turnstile token in production to keep the form fail-closed.
  if (captchaRequired) {
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      logApiEvent('warn', context, 'contact.captcha_missing')
      return createErrorResponse(context, {
        code: 'contact_captcha_required',
        message: 'Captcha verification is required.',
        status: 400,
      })
    }

    let turnstileValid = false
    try {
      turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp)
    } catch (error) {
      logApiEvent('error', context, 'contact.captcha_check_failed', {
        error: getErrorSummary(error),
      })
    }

    if (!turnstileValid) {
      logApiEvent('warn', context, 'contact.captcha_rejected')
      return createErrorResponse(context, {
        code: 'contact_captcha_failed',
        message: 'Captcha verification failed.',
        status: 400,
      })
    }
  }

  // Build email HTML
  const servicesText = normalizedServices.length > 0 ? normalizedServices.join(', ') : '-'
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #8B0000; border-bottom: 2px solid #8B0000; padding-bottom: 8px;">새 문의가 도착했습니다</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; width: 140px; vertical-align: top; border-bottom: 1px solid #eee;">이름</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(normalizedName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">이메일</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(normalizedEmail)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">전화번호</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(normalizedPhone || '-')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">관심 서비스</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(servicesText)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">장르</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(normalizedGenre || '-')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top;">메시지</td>
          <td style="padding: 10px 8px; white-space: pre-line;">${escapeHtml(normalizedMessage)}</td>
        </tr>
      </table>
    </div>
  `

  let inquirySaved = false

  // Save to Inquiries collection in CMS
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'inquiries',
      data: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone || undefined,
        services: normalizedServices.length > 0 ? normalizedServices : null,
        genre: normalizedGenre || undefined,
        message: normalizedMessage,
        isRead: false,
      },
    })
    inquirySaved = true
  } catch (err) {
    logApiEvent('error', context, 'contact.persist_failed', {
      error: getErrorSummary(err),
    })
    // Continue to send email even if DB save fails
  }

  // Send email notification (only if SMTP is configured)
  let emailSent = false
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"Garlicton Studio" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL,
        subject: `[갈릭톤 스튜디오] 새 문의: ${normalizedName}`,
        html: htmlBody,
        replyTo: normalizedEmail,
      })
      emailSent = true
    } catch (err) {
      logApiEvent('error', context, 'contact.email_failed', {
        error: getErrorSummary(err),
      })
      // Don't fail the request — inquiry is already saved to DB
    }
  }

  logApiEvent('info', context, 'contact.accepted', {
    emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    emailDomain: getEmailDomain(normalizedEmail),
    emailSent,
    hasGenre: Boolean(normalizedGenre),
    hasPhone: Boolean(normalizedPhone),
    inquirySaved,
    serviceCount: normalizedServices.length,
  })

  if (!shouldAcknowledgeContactSubmission({ inquirySaved, emailSent })) {
    logApiEvent('error', context, 'contact.delivery_failed', {
      emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    })
    return createErrorResponse(context, {
      code: 'contact_delivery_failed',
      message: 'Your inquiry could not be delivered. Please try again shortly.',
      status: 503,
    })
  }

  return createSuccessResponse(context)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isAllowedService(service: unknown): service is AllowedService {
  return typeof service === 'string' && ALLOWED_SERVICE_SET.has(service as AllowedService)
}

function getEmailDomain(email: string): string | null {
  const [, domain] = email.split('@')

  return domain || null
}

function consumeRateLimitToken(clientIp: string): { ok: boolean; retryAfterMs: number } {
  const store = getRateLimitStore()
  const now = Date.now()

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }

  const current = store.get(clientIp)

  if (!current || current.resetAt <= now) {
    store.set(clientIp, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    })

    return { ok: true, retryAfterMs: 0 }
  }

  if (current.count >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return { ok: false, retryAfterMs: current.resetAt - now }
  }

  current.count += 1
  store.set(clientIp, current)
  return { ok: true, retryAfterMs: 0 }
}

function getRateLimitStore(): Map<string, RateLimitEntry> {
  if (!globalThis.__garlictonContactRateLimitStore) {
    globalThis.__garlictonContactRateLimitStore = new Map()
  }

  return globalThis.__garlictonContactRateLimitStore
}
