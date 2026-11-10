import { describe, expect, it } from 'vitest'
import { sampleStar } from './AsciiCanvas'

describe('sampleStar', () => {
  it('fora do círculo unitário é vazio', () => {
    expect(sampleStar(1.2, 0, 0, 0)).toBe(0)
  })

  it('o centro está preenchido e os vales entre as pontas estão vazios', () => {
    expect(sampleStar(0, 0, 0, 0)).toBeGreaterThan(0)
    // Com rot = 0, as pontas ficam no centro de cada segmento (ângulo seg/2);
    // o vale fica em ângulo 0 — a 0.6 do raio já está fora da borda (0.42).
    expect(sampleStar(0.6, 0, 0, 0)).toBe(0)
    const seg = (Math.PI * 2) / 5
    const tipAngle = seg / 2
    expect(sampleStar(Math.cos(tipAngle) * 0.8, Math.sin(tipAngle) * 0.8, 0, 0)).toBeGreaterThan(0)
  })

  it('só devolve os níveis de brilho previstos', () => {
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i += 1) {
      const nx = Math.random() * 2 - 1
      const ny = Math.random() * 2 - 1
      seen.add(sampleStar(nx, ny, 1.3, 0.2))
    }
    for (const v of seen) expect([0, 0.28, 0.7, 0.9]).toContain(v)
  })
})
