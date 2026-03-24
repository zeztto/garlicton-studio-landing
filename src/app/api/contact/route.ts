import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { verifyTurnstileToken } from '@/lib/turnstile'

export async function POST(req: NextRequest) {
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

  // Validate required fields
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  // Verify Turnstile token
  const turnstileValid = await verifyTurnstileToken(turnstileToken || '')
  if (!turnstileValid) {
    return NextResponse.json({ error: 'Captcha verification failed.' }, { status: 400 })
  }

  // Build email HTML
  const servicesText = Array.isArray(services) && services.length > 0 ? services.join(', ') : '-'
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #8B0000; border-bottom: 2px solid #8B0000; padding-bottom: 8px;">새 문의가 도착했습니다</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; width: 140px; vertical-align: top; border-bottom: 1px solid #eee;">이름</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">이메일</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(email)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">전화번호</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(phone || '-')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">관심 서비스</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(servicesText)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top; border-bottom: 1px solid #eee;">장르</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #eee;">${escapeHtml(genre || '-')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 8px; font-weight: bold; vertical-align: top;">메시지</td>
          <td style="padding: 10px 8px; white-space: pre-line;">${escapeHtml(message)}</td>
        </tr>
      </table>
    </div>
  `

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
      subject: `[갈릭톤 스튜디오] 새 문의: ${name}`,
      html: htmlBody,
      replyTo: email,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact API] Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
