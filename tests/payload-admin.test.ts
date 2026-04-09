import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clampNumber,
  normalizeEmailDisplay,
  normalizeExternalUrl,
  normalizeOptionalHref,
  normalizeSectionOrder,
  normalizeTrimmedString,
  pruneEmptyRows,
} from '../src/lib/payload-admin'

test('normalizeTrimmedString trims text and collapses empty strings to undefined', () => {
  assert.equal(normalizeTrimmedString('  Garlicton  '), 'Garlicton')
  assert.equal(normalizeTrimmedString('   '), undefined)
  assert.equal(normalizeTrimmedString(42), undefined)
})

test('normalizeSectionOrder deduplicates configured sections and backfills missing defaults', () => {
  assert.deepEqual(
    normalizeSectionOrder([
      { section: 'about' },
      { section: 'about' },
      { section: 'contact' },
      { section: 'invalid' },
    ]),
    [
      { section: 'about' },
      { section: 'contact' },
      { section: 'hero' },
      { section: 'services' },
      { section: 'portfolio' },
      { section: 'studio' },
    ],
  )
})

test('href and contact helpers normalize common operator input', () => {
  assert.equal(normalizeOptionalHref(' contact ', '#contact'), '/contact')
  assert.equal(normalizeOptionalHref('  ', '#contact'), '#contact')
  assert.equal(normalizeExternalUrl('www.instagram.com/garlicton'), 'https://www.instagram.com/garlicton')
  assert.equal(normalizeExternalUrl('https://kakao.example/channel'), 'https://kakao.example/channel')
  assert.equal(normalizeEmailDisplay('  ', 'hello@garlicton.com'), 'hello@garlicton.com')
})

test('clampNumber and pruneEmptyRows stabilize admin draft data', () => {
  assert.equal(clampNumber(120, 37.7, -90, 90), 90)
  assert.equal(clampNumber(undefined, 37.7, -90, 90), 37.7)

  assert.deepEqual(
    pruneEmptyRows(
      [
        { period: '2024', description_ko: '', description_en: '' },
        { period: ' ', description_ko: ' ', description_en: '' },
        { period: '', description_ko: 'Worked on album', description_en: '' },
      ],
      ['period', 'description_ko', 'description_en'],
    ),
    [
      { period: '2024', description_ko: '', description_en: '' },
      { period: '', description_ko: 'Worked on album', description_en: '' },
    ],
  )
})
