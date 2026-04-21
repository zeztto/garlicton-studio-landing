import assert from 'node:assert/strict'
import test from 'node:test'
import { getSafeHref } from '../src/lib/url-safety'

test('getSafeHref allows only safe protocols and relative targets', () => {
  assert.equal(getSafeHref('https://www.garlicton.com/pages/test'), 'https://www.garlicton.com/pages/test')
  assert.equal(getSafeHref('mailto:hello@garlicton.com'), 'mailto:hello@garlicton.com')
  assert.equal(getSafeHref('tel:+821012345678'), 'tel:+821012345678')
  assert.equal(getSafeHref('/ko/pages/test'), '/ko/pages/test')
  assert.equal(getSafeHref('#contact'), '#contact')
  assert.equal(getSafeHref('//evil.example/steal'), '#')
  assert.equal(getSafeHref('javascript:alert(1)'), '#')
  assert.equal(getSafeHref('data:text/html;base64,Zm9v'), '#')
  assert.equal(getSafeHref('ftp://example.com/file'), '#')
})
