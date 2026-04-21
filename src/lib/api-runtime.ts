import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'

type ApiLogLevel = 'error' | 'info' | 'warn'

type ApiError = {
  code: string
  message: string
  status: number
}

type HeadersLike = Headers | Pick<Headers, 'get'>
type RequestLike = Pick<Request, 'headers' | 'method' | 'url'>

export type ApiRequestContext = {
  clientIp: string
  clientIpFingerprint: string
  method: string
  path: string
  requestId: string
  route: string
}

export const getRequestIdHeaderName = (): string => 'x-request-id'

export const getRequestIdFromHeaders = (headers: HeadersLike): null | string => {
  const requestId = headers.get(getRequestIdHeaderName())?.trim()

  return requestId || null
}

export const getClientIpFromHeaders = (headers: HeadersLike): string => {
  const forwardedFor = headers.get('x-forwarded-for')

  if (forwardedFor) {
    const forwardedChain = forwardedFor
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (forwardedChain.length > 0) {
      return forwardedChain[0]
    }
  }

  return 'unknown'
}

const getClientIpFingerprint = (clientIp: string): string => {
  return createHash('sha256').update(clientIp).digest('hex').slice(0, 12)
}

export const createApiRequestContext = (
  request: RequestLike,
  route: string,
): ApiRequestContext => {
  const requestId = getRequestIdFromHeaders(request.headers) || randomUUID()
  const clientIp = getClientIpFromHeaders(request.headers)

  return {
    clientIp,
    clientIpFingerprint: getClientIpFingerprint(clientIp),
    method: request.method,
    path: new URL(request.url).pathname,
    requestId,
    route,
  }
}

const withRequestIdHeaders = (context: ApiRequestContext, init: ResponseInit = {}): ResponseInit => {
  const headers = new Headers(init.headers)
  headers.set(getRequestIdHeaderName(), context.requestId)

  return {
    ...init,
    headers,
  }
}

export const createSuccessResponse = (
  context: ApiRequestContext,
  body: Record<string, unknown> = {},
  init: ResponseInit = {},
) => {
  return NextResponse.json(
    {
      ...body,
      requestId: context.requestId,
      success: true,
    },
    withRequestIdHeaders(context, init),
  )
}

export const createErrorResponse = (
  context: ApiRequestContext,
  error: ApiError,
  init: ResponseInit = {},
) => {
  return NextResponse.json(
    {
      code: error.code,
      error: error.message,
      requestId: context.requestId,
      success: false,
    },
    withRequestIdHeaders(context, {
      ...init,
      status: error.status,
    }),
  )
}

export const createRedirectResponse = (
  context: ApiRequestContext,
  url: string | URL,
  init: ResponseInit = {},
) => {
  const response = NextResponse.redirect(url, init.status ?? 307)
  response.headers.set(getRequestIdHeaderName(), context.requestId)

  const extraHeaders = new Headers(init.headers)
  for (const [key, value] of extraHeaders.entries()) {
    response.headers.set(key, value)
  }

  return response
}

export const getErrorSummary = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Unknown error'
}

export const logApiEvent = (
  level: ApiLogLevel,
  context: ApiRequestContext,
  event: string,
  meta?: Record<string, unknown>,
): void => {
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info

  logger(
    JSON.stringify({
      clientIpFingerprint: context.clientIpFingerprint,
      event,
      level,
      method: context.method,
      path: context.path,
      requestId: context.requestId,
      route: context.route,
      ...(meta ? { meta } : {}),
    }),
  )
}
