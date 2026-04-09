import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHomePath,
  buildPagePath,
  getPreviewAccessError,
  isValidPreviewSecret,
  normalizeHomePreviewAnchor,
  resolvePreviewRedirectPath,
} from '../src/lib/preview'

const ORIGINAL_PREVIEW_SECRET = process.env.PREVIEW_SECRET

function withPreviewSecret(secret: string | undefined, run: () => void) {
  if (typeof secret === 'string') {
    process.env.PREVIEW_SECRET = secret
  } else {
    delete process.env.PREVIEW_SECRET
  }

  try {
    run()
  } finally {
    if (typeof ORIGINAL_PREVIEW_SECRET === 'string') {
      process.env.PREVIEW_SECRET = ORIGINAL_PREVIEW_SECRET
    } else {
      delete process.env.PREVIEW_SECRET
    }
  }
}

test('getPreviewAccessError requires configured secret and matching candidate', () => {
  withPreviewSecret(undefined, () => {
    assert.deepEqual(getPreviewAccessError('anything'), {
      error: 'Preview secret is not configured.',
      status: 503,
    })
  })

  withPreviewSecret('preview-secret', () => {
    assert.equal(isValidPreviewSecret('preview-secret'), true)
    assert.equal(isValidPreviewSecret('wrong-secret'), false)
    assert.deepEqual(getPreviewAccessError('wrong-secret'), {
      error: 'Invalid preview secret.',
      status: 401,
    })
    assert.equal(getPreviewAccessError('preview-secret'), null)
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
