import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHomePath,
  buildHomePreviewURL,
  buildPagePath,
  buildPagePreviewURL,
  getPreviewAccessError,
  normalizeHomePreviewAnchor,
  resolvePreviewRedirectPath,
} from '../src/lib/preview'

const ORIGINAL_PREVIEW_SECRET = process.env.PREVIEW_SECRET
const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

function withPreviewEnv(
  values: { previewSecret?: string; siteUrl?: string },
  run: () => void,
) {
  if (typeof values.previewSecret === 'string') {
    process.env.PREVIEW_SECRET = values.previewSecret
  } else {
    delete process.env.PREVIEW_SECRET
  }

  if (typeof values.siteUrl === 'string') {
    process.env.NEXT_PUBLIC_SITE_URL = values.siteUrl
  } else {
    delete process.env.NEXT_PUBLIC_SITE_URL
  }

  try {
    run()
  } finally {
    if (typeof ORIGINAL_PREVIEW_SECRET === 'string') {
      process.env.PREVIEW_SECRET = ORIGINAL_PREVIEW_SECRET
    } else {
      delete process.env.PREVIEW_SECRET
    }

    if (typeof ORIGINAL_SITE_URL === 'string') {
      process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL
    }
  }
}

test('preview URLs use signed tokens instead of leaking raw secrets', () => {
  withPreviewEnv({
    previewSecret: 'preview-secret',
    siteUrl: 'https://www.garlicton.com',
  }, () => {
    const pagePreviewUrl = buildPagePreviewURL({ locale: 'en', slug: 'Draft Page' })
    const homePreviewUrl = buildHomePreviewURL({ locale: 'ko', anchor: 'about' })

    assert.ok(pagePreviewUrl)
    assert.ok(homePreviewUrl)

    const pageUrl = new URL(pagePreviewUrl!)
    const homeUrl = new URL(homePreviewUrl!)

    assert.equal(pageUrl.searchParams.has('secret'), false)
    assert.equal(homeUrl.searchParams.has('secret'), false)
    assert.equal(pageUrl.searchParams.has('token'), true)
    assert.equal(homeUrl.searchParams.has('token'), true)
    assert.equal(pageUrl.searchParams.has('expires'), true)
    assert.equal(homeUrl.searchParams.has('expires'), true)

    assert.equal(getPreviewAccessError({
      expiresAt: pageUrl.searchParams.get('expires'),
      locale: pageUrl.searchParams.get('locale'),
      path: pageUrl.searchParams.get('path'),
      slug: pageUrl.searchParams.get('slug'),
      token: pageUrl.searchParams.get('token'),
    }), null)

    assert.equal(getPreviewAccessError({
      anchor: homeUrl.searchParams.get('anchor'),
      expiresAt: homeUrl.searchParams.get('expires'),
      locale: homeUrl.searchParams.get('locale'),
      path: homeUrl.searchParams.get('path'),
      token: homeUrl.searchParams.get('token'),
    }), null)
  })
})

test('getPreviewAccessError rejects missing config, expired tokens, and tampering', () => {
  withPreviewEnv({
    previewSecret: undefined,
    siteUrl: 'https://www.garlicton.com',
  }, () => {
    assert.deepEqual(getPreviewAccessError({
      token: 'anything',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }), {
      error: 'Preview secret is not configured.',
      status: 503,
    })
  })

  withPreviewEnv({
    previewSecret: 'preview-secret',
    siteUrl: 'https://www.garlicton.com',
  }, () => {
    const previewUrl = new URL(buildPagePreviewURL({ locale: 'ko', slug: 'draft-page' })!)

    assert.deepEqual(getPreviewAccessError({
      expiresAt: previewUrl.searchParams.get('expires'),
      locale: previewUrl.searchParams.get('locale'),
      path: previewUrl.searchParams.get('path'),
      slug: previewUrl.searchParams.get('slug'),
      token: 'tampered-token',
    }), {
      error: 'Invalid preview token.',
      status: 401,
    })

    assert.deepEqual(getPreviewAccessError({
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      locale: previewUrl.searchParams.get('locale'),
      path: previewUrl.searchParams.get('path'),
      slug: previewUrl.searchParams.get('slug'),
      token: previewUrl.searchParams.get('token'),
    }), {
      error: 'Preview token has expired.',
      status: 401,
    })
  })
})

test('resolvePreviewRedirectPath allows only safe relative paths and falls back to slug/list paths', () => {
  assert.equal(
    resolvePreviewRedirectPath({
      locale: 'en',
      path: '/en/pages/custom-preview',
      slug: 'ignored',
    }),
    '/en/pages/custom-preview',
  )

  assert.equal(
    resolvePreviewRedirectPath({
      locale: 'en',
      path: 'https://evil.example/steal',
      slug: 'Draft Page',
    }),
    buildPagePath({ locale: 'en', slug: 'draft-page' }),
  )

  assert.equal(
    resolvePreviewRedirectPath({
      locale: 'ko',
      path: '//evil.example/steal',
      slug: null,
    }),
    '/ko/pages',
  )
})

test('home preview helpers normalize allowed section anchors only', () => {
  assert.equal(normalizeHomePreviewAnchor('about'), 'about')
  assert.equal(normalizeHomePreviewAnchor('#studio'), 'studio')
  assert.equal(normalizeHomePreviewAnchor('https://evil.example'), null)
  assert.equal(normalizeHomePreviewAnchor('unknown'), null)

  assert.equal(buildHomePath({ locale: 'en' }), '/en')
  assert.equal(buildHomePath({ locale: 'ko', anchor: 'portfolio' }), '/ko#portfolio')
})
