import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPreviewAccessError, resolvePreviewRedirectPath } from '@/lib/preview'

export async function GET(request: NextRequest) {
  const accessError = getPreviewAccessError(request.nextUrl.searchParams.get('secret'))
  if (accessError) {
    return NextResponse.json(
      { error: accessError.error },
      { status: accessError.status },
    )
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(resolvePreviewRedirectPath({
    locale: request.nextUrl.searchParams.get('locale'),
    path: request.nextUrl.searchParams.get('path'),
    slug: request.nextUrl.searchParams.get('slug'),
  }), request.url))
}
