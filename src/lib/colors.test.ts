import { describe, it, expect } from 'vitest'
import { getHouseholdStyle, getHouseholdFadedStyle } from './colors'

describe('getHouseholdStyle', () => {
  it('returns the backgroundColor as the passed color', () => {
    const style = getHouseholdStyle('#22c55e')
    expect(style.backgroundColor).toBe('#22c55e')
  })

  it('returns black text for medium-bright colors', () => {
    // #22c55e (green): luminance = (0.299*34 + 0.587*197 + 0.114*94)/255 ≈ 0.535 → black
    const style = getHouseholdStyle('#22c55e')
    expect(style.color).toBe('#000000')
  })

  it('returns white text for dark colors', () => {
    // #1e3a5f (dark navy) — luminance well below 0.5 → white text
    const style = getHouseholdStyle('#1e3a5f')
    expect(style.color).toBe('#ffffff')
  })

  it('returns black text for light colors', () => {
    // #facc15 (yellow) — high luminance → black text
    const style = getHouseholdStyle('#facc15')
    expect(style.color).toBe('#000000')
  })

  it('handles household colors from the spec', () => {
    const colors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444']
    for (const color of colors) {
      const style = getHouseholdStyle(color)
      expect(style.backgroundColor).toBe(color)
      expect(['#ffffff', '#000000']).toContain(style.color)
    }
  })
})

describe('getHouseholdFadedStyle', () => {
  it('returns rgba with 0.33 alpha for the background', () => {
    const style = getHouseholdFadedStyle('#22c55e')
    expect(style.backgroundColor as string).toMatch(/^rgba\(34, 197, 94, 0\.33\)$/)
  })

  it('uses the original color as text color for readability on faded bg', () => {
    const style = getHouseholdFadedStyle('#3b82f6')
    expect(style.color).toBe('#3b82f6')
  })

  it('all spec household colors produce valid faded styles', () => {
    const colors = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ef4444']
    for (const color of colors) {
      const style = getHouseholdFadedStyle(color)
      expect(style.backgroundColor).toBeTruthy()
      expect(style.color).toBe(color)
    }
  })

  it('faded red #ef4444 has correct RGB values', () => {
    const style = getHouseholdFadedStyle('#ef4444')
    expect(style.backgroundColor).toBe('rgba(239, 68, 68, 0.33)')
  })
})
