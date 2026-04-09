import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createApiRequestContext,
  createErrorResponse,
  createSuccessResponse,
  getClientIpFromHeaders,
  getRequestIdHeaderName,
  getRequestIdFromHeaders,
} from '../src/lib/api-runtime'

test('request context reuses upstream request id and client ip headers', async () => {
  const request = new Request('https://www.garlicton.com/api/contact', {
    headers: {
      'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      'x-request-id': 'req-from-proxy',
    },
    method: 'POST',
  })

  const context = createApiRequestContext(request, 'contact.submit')

  assert.equal(getRequestIdFromHeaders(request.headers), 'req-from-proxy')
  assert.equal(getClientIpFromHeaders(request.headers), '203.0.113.10')
  assert.equal(context.requestId, 'req-from-proxy')
  assert.equal(context.clientIp, '203.0.113.10')
  assert.equal(context.method, 'POST')
  assert.equal(context.path, '/api/contact')
  assert.equal(typeof context.clientIpFingerprint, 'string')
})

test('success and error responses expose request ids in body and headers', async () => {
  const request = new Request('https://www.garlicton.com/api/contact', {
    headers: {
      'x-request-id': 'req-123',
    },
    method: 'POST',
  })

  const context = createApiRequestContext(request, 'contact.submit')
  const successResponse = createSuccessResponse(context, { accepted: true })
  const errorResponse = createErrorResponse(context, {
    code: 'contact_validation_error',
    message: 'Invalid email address.',
    status: 400,
  })

  assert.equal(successResponse.headers.get(getRequestIdHeaderName()), 'req-123')
  assert.equal(errorResponse.headers.get(getRequestIdHeaderName()), 'req-123')
  assert.deepEqual(await successResponse.json(), {
    accepted: true,
    requestId: 'req-123',
    success: true,
  })
  assert.deepEqual(await errorResponse.json(), {
    code: 'contact_validation_error',
    error: 'Invalid email address.',
    requestId: 'req-123',
    success: false,
  })
})
