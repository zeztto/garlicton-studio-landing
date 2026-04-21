import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldAcknowledgeContactSubmission } from '../src/lib/contact-delivery'

test('contact submissions are acknowledged only when storage or email delivery succeeds', () => {
  assert.equal(shouldAcknowledgeContactSubmission({
    inquirySaved: true,
    emailSent: false,
  }), true)

  assert.equal(shouldAcknowledgeContactSubmission({
    inquirySaved: false,
    emailSent: true,
  }), true)

  assert.equal(shouldAcknowledgeContactSubmission({
    inquirySaved: false,
    emailSent: false,
  }), false)
})
