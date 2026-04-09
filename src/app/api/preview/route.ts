import { draftMode } from 'next/headers'
import { NextRequest } from 'next/server'
import { createApiRequestContext, createErrorResponse, createRedirectResponse, logApiEvent } from '@/lib/api-runtime'
import { getPreviewAccessError, resolvePreviewRedirectPath } from '@/lib/preview'

export async function GET(request: NextRequest) {
  const context = createApiRequestContext(request, 'preview.enable')
  const accessError = getPreviewAccessError(request.nextUrl.searchParams.get('secret'))
  if (accessError) {
    const errorCode = accessError.status === 503
      ? 'preview_not_configured'
      : 'preview_invalid_secret'

    logApiEvent('warn', context, 'preview.access_denied', {
      code: errorCode,
      status: accessError.status,
    })

    return createErrorResponse(context, {
      code: errorCode,
      message: accessError.error,
      status: accessError.status,
    })
  }

  const draft = await draftMode()
  draft.enable()

  const redirectPath = resolvePreviewRedirectPath({
    locale: request.nextUrl.searchParams.get('locale'),
    path: request.nextUrl.searchParams.get('path'),
    slug: request.nextUrl.searchParams.get('slug'),
  })

  logApiEvent('info', context, 'preview.enabled', {
    locale: request.nextUrl.searchParams.get('locale') || 'ko',
    redirectPath,
  })

  return createRedirectResponse(context, new URL(redirectPath, request.url))
}
