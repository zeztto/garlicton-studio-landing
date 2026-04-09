import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getCloudinaryRuntimeConfig,
  getPayloadSecret,
  getPreviewSecret,
  getSiteUrl,
  hasCloudinaryRuntimeConfig,
  requireCloudinaryRuntimeConfig,
  requirePayloadSecret,
} from '../src/lib/runtime-config'

const ORIGINAL_NODE_ENV = process.env.NODE_ENV
const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
const ORIGINAL_PREVIEW_SECRET = process.env.PREVIEW_SECRET
const ORIGINAL_PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
const ORIGINAL_CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const ORIGINAL_CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const ORIGINAL_CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

function restoreEnv() {
  if (typeof ORIGINAL_NODE_ENV === 'string') {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV
  } else {
    delete process.env.NODE_ENV
  }

  if (typeof ORIGINAL_SITE_URL === 'string') {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
  } else {
    delete process.env.NEXT_PUBLIC_SITE_URL
  }

  if (typeof ORIGINAL_PREVIEW_SECRET === 'string') {
    process.env.PREVIEW_SECRET = ORIGINAL_PREVIEW_SECRET
  } else {
    delete process.env.PREVIEW_SECRET
  }

  if (typeof ORIGINAL_PAYLOAD_SECRET === 'string') {
    process.env.PAYLOAD_SECRET = ORIGINAL_PAYLOAD_SECRET
  } else {
    delete process.env.PAYLOAD_SECRET
  }

  if (typeof ORIGINAL_CLOUDINARY_CLOUD_NAME === 'string') {
    process.env.CLOUDINARY_CLOUD_NAME = ORIGINAL_CLOUDINARY_CLOUD_NAME
  } else {
    delete process.env.CLOUDINARY_CLOUD_NAME
  }

  if (typeof ORIGINAL_CLOUDINARY_API_KEY === 'string') {
    process.env.CLOUDINARY_API_KEY = ORIGINAL_CLOUDINARY_API_KEY
  } else {
    delete process.env.CLOUDINARY_API_KEY
  }

  if (typeof ORIGINAL_CLOUDINARY_API_SECRET === 'string') {
    process.env.CLOUDINARY_API_SECRET = ORIGINAL_CLOUDINARY_API_SECRET
  } else {
    delete process.env.CLOUDINARY_API_SECRET
  }
}

test.afterEach(() => {
  restoreEnv()
})

test('site and preview helpers normalize trimmed env values', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.garlicton.com///'
  process.env.PREVIEW_SECRET = '  preview-secret  '

  assert.equal(getSiteUrl(), 'https://preview.garlicton.com')
  assert.equal(getPreviewSecret(), 'preview-secret')

  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.PREVIEW_SECRET

  assert.equal(getSiteUrl(), 'https://www.garlicton.com')
  assert.equal(getPreviewSecret(), null)
})

test('payload secret uses dev fallback and fails closed in production', () => {
  process.env.NODE_ENV = 'development'
  delete process.env.PAYLOAD_SECRET

  assert.equal(getPayloadSecret(), 'development-only-payload-secret')
  assert.equal(requirePayloadSecret('runtime-config.test'), 'development-only-payload-secret')

  process.env.NODE_ENV = 'production'
  delete process.env.PAYLOAD_SECRET

  assert.equal(getPayloadSecret(), null)
  assert.throws(
    () => requirePayloadSecret('runtime-config.test'),
    /\[runtime-config\.test\] PAYLOAD_SECRET must be set in production\./,
  )
})

test('cloudinary runtime config reports readiness and production requirements', () => {
  process.env.NODE_ENV = 'development'
  delete process.env.CLOUDINARY_CLOUD_NAME
  delete process.env.CLOUDINARY_API_KEY
  delete process.env.CLOUDINARY_API_SECRET

  assert.deepEqual(getCloudinaryRuntimeConfig(), {
    apiKey: '',
    apiSecret: '',
    cloudName: 'dnlcuy2aj',
    configured: false,
  })
  assert.equal(hasCloudinaryRuntimeConfig(), false)

  process.env.NODE_ENV = 'production'
  process.env.CLOUDINARY_CLOUD_NAME = 'cloud'
  process.env.CLOUDINARY_API_KEY = 'key'
  process.env.CLOUDINARY_API_SECRET = 'secret'

  assert.deepEqual(requireCloudinaryRuntimeConfig('runtime-config.test'), {
    apiKey: 'key',
    apiSecret: 'secret',
    cloudName: 'cloud',
    configured: true,
  })
  assert.equal(hasCloudinaryRuntimeConfig(), true)

  delete process.env.CLOUDINARY_API_SECRET

  assert.throws(
    () => requireCloudinaryRuntimeConfig('runtime-config.test'),
    /\[runtime-config\.test\] CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set in production\./,
  )
})
