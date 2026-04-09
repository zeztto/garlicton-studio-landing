import { randomUUID } from 'node:crypto'

type HeadersLike = Headers | Pick<Headers, 'get'>

type ApiLogLevel = 'error' | 'info' | 'warn'

export type ApiRequestContext = {
  requestId: string
  route: string
}

export const createApiRequestContext = (
  route: string,
  headers: HeadersLike,
): ApiRequestContext => {
  const forwardedRequestId = headers.get('x-request-id')?.trim()

  return {
    requestId: forwardedRequestId || randomUUID(),
    route,
  }
}

export const withRequestIdHeaders = (
  requestId: string,
  init: ResponseInit = {},
): ResponseInit => {
  const headers = new Headers(init.headers)
  headers.set('x-request-id', requestId)

  return {
    ...init,
    headers,
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Unknown error'
}

export const logApiEvent = ({
  context,
  level,
  message,
  meta,
}: {
  context: ApiRequestContext
  level?: ApiLogLevel
  message: string
  meta?: Record<string, unknown>
}): void => {
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info

  logger(
    JSON.stringify({
      level: level ?? 'info',
      route: context.route,
      requestId: context.requestId,
      message,
      ...(meta ? { meta } : {}),
    }),
  )
}
