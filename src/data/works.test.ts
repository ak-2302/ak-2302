import { describe, expect, it } from 'vitest'
import { getWorkBySlug, works } from './works'

describe('works data', () => {
  it('contains enough representative works for the initial portfolio', () => {
    expect(works.length).toBeGreaterThanOrEqual(3)
    for (const work of works) {
      expect(work.slug).toMatch(/^[a-z0-9-]+$/)
      expect(work.title).toBeTruthy()
      expect(work.summary).toBeTruthy()
      expect(work.technologies.length).toBeGreaterThan(0)
    }
  })

  it('resolves a work by slug and returns undefined for an unknown slug', () => {
    expect(getWorkBySlug('image-audio-to-video')?.title).toBe('image / audio → video')
    expect(getWorkBySlug('missing-work')).toBeUndefined()
  })
})
