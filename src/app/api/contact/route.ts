import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { getPayloadClient } from '@/lib/payload'

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5
const ALLOWED_SERVICE_VALUES = new Set(['recording', 'mixing', 'mastering', 'producing'])

type RateLimitEntry = {
  count: number
  resetAt: number
}

declare global {
  var __garlictonContactRateLimitStore: Map<string, RateLimitEntry> | undefined
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimit = consumeRateLimitToken(clientIp)
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Too many contact attempts. Please try again later.' },
      {
        status: 429,
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
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
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
    return NextResponse.json({ success: true })
  }

  const normalizedName = typeof name === 'string' ? name.trim() : ''
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
  const normalizedGenre = typeof genre === 'string' ? genre.trim() : ''
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  const normalizedServices = Array.isArray(services)
    ? services.filter((service): service is string => typeof service === 'string' && ALLOWED_SERVICE_VALUES.has(service))
    : []
  const captchaRequired = process.env.NODE_ENV === 'production'
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim()

  // Validate required fields
  if (!normalizedName || !normalizedEmail || !normalizedMessage) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Validate phone format (optional, but if provided must be digits/dashes/spaces/parens/plus only)
  if (normalizedPhone && !/^[\d\-+() ]{4,20}$/.test(normalizedPhone)) {
    return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 })
  }

  if (captchaRequired && !turnstileSecret) {
    return NextResponse.json({ error: 'Contact form is temporarily unavailable.' }, { status: 503 })
  }

  // Verify Turnstile token in production to keep the form fail-closed.
  if (captchaRequired) {
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      return NextResponse.json({ error: 'Captcha verification is required.' }, { status: 400 })
    }

    const turnstileValid = await verifyTurnstileToken(turnstileToken, clientIp)
    if (!turnstileValid) {
      return NextResponse.json({ error: 'Captcha verification failed.' }, { status: 400 })
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

  // Save to Inquiries collection in CMS
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'inquiries',
      data: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone || undefined,
        services: normalizedServices.length > 0 ? normalizedServices : undefined,
        genre: normalizedGenre || undefined,
        message: normalizedMessage,
        isRead: false,
      },
    })
  } catch (err) {
    console.error('[Contact API] DB save error:', err)
    // Continue to send email even if DB save fails
  }

  // Send email notification (only if SMTP is configured)
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
    } catch (err) {
      console.error('[Contact API] Email send error:', err)
      // Don't fail the request — inquiry is already saved to DB
    }
  }

  return NextResponse.json({ success: true })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.headers.get('x-real-ip')?.trim() || 'unknown'
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
