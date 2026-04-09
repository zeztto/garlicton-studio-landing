import test from 'node:test'
import assert from 'node:assert/strict'
import {
  comparePublishedPages,
  getPageWorkflowTimestamp,
  normalizePageSlug,
  shouldIncludePageInList,
} from '../src/lib/pages-workflow'

test('normalizePageSlug normalizes whitespace, underscores, and casing', () => {
  assert.equal(normalizePageSlug('  Mixing_Guide 2026  '), 'mixing-guide-2026')
  assert.equal(normalizePageSlug('Already-clean'), 'already-clean')
  assert.equal(normalizePageSlug('___Hello___World___'), 'hello-world')
})

test('shouldIncludePageInList hides only explicit false unless includeHidden is true', () => {
  assert.equal(shouldIncludePageInList({ slug: 'visible' }), true)
  assert.equal(shouldIncludePageInList({ slug: 'hidden', showInList: false }), false)
  assert.equal(shouldIncludePageInList({ slug: 'hidden', showInList: false }, true), true)
})

test('getPageWorkflowTimestamp prefers publishedAt over updatedAt and createdAt', () => {
  assert.equal(
    getPageWorkflowTimestamp({
      slug: 'page',
      publishedAt: '2026-04-10T10:00:00.000Z',
      updatedAt: '2026-04-09T10:00:00.000Z',
      createdAt: '2026-04-08T10:00:00.000Z',
    }),
    '2026-04-10T10:00:00.000Z',
  )
})

test('comparePublishedPages sorts featured first, then sortOrder, then timestamp desc, then slug', () => {
  const pages = [
    { slug: 'gamma', featured: false, sortOrder: 5, publishedAt: '2026-04-08T00:00:00.000Z' },
    { slug: 'alpha', featured: true, sortOrder: 9, publishedAt: '2026-04-07T00:00:00.000Z' },
    { slug: 'beta', featured: false, sortOrder: 1, publishedAt: '2026-04-09T00:00:00.000Z' },
    { slug: 'delta', featured: false, sortOrder: 1, publishedAt: '2026-04-10T00:00:00.000Z' },
  ]

  const sorted = [...pages].sort(comparePublishedPages)

  assert.deepEqual(
    sorted.map((page) => page.slug),
    ['alpha', 'delta', 'beta', 'gamma'],
  )
})
