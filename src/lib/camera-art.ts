// Silhueta vetorial de uma câmera analógica desenhada em um canvas offscreen
// (linhas brancas sobre preto) e um "sampler" que devolve a luminosidade de um
// ponto normalizado. É a fonte do motor ASCII da seção Fotografia: nenhuma
// imagem externa, só geometria desenhada por código.

export const CAMERA_ART_WIDTH = 280
export const CAMERA_ART_HEIGHT = 200

/** Sampler: (x, y) no espaço normalizado [-1, 1] do canvas visível → brilho 0..1. */
export type Sampler = (x: number, y: number, t: number, ctx: { aspect: number; wobble: boolean }) => number

export function drawCameraSilhouette(ctx: CanvasRenderingContext2D): void {
  const W = CAMERA_ART_WIDTH
  const H = CAMERA_ART_HEIGHT
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Corpo da câmera com cantos arredondados
  const bx = 30
  const by = 55
  const bw = 220
  const bh = 125
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 14)
  ctx.stroke()

  // Topo / visor prismático central
  ctx.beginPath()
  ctx.moveTo(95, 55)
  ctx.lineTo(110, 30)
  ctx.lineTo(170, 30)
  ctx.lineTo(185, 55)
  ctx.closePath()
  ctx.stroke()

  // Botão de disparo à esquerda e disco seletor à direita
  ctx.strokeRect(50, 42, 22, 13)
  ctx.strokeRect(205, 46, 26, 9)

  // Lente: anéis concêntricos (o segundo mais grosso)
  const cx = W / 2
  const cy = by + bh / 2 + 5
  const rings = [54, 44, 32, 18]
  rings.forEach((r, idx) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.lineWidth = idx === 1 ? 4 : 2
    ctx.stroke()
  })

  // Ponto de reflexo focal na lente
  ctx.beginPath()
  ctx.arc(cx + 8, cy - 8, 4, 0, Math.PI * 2)
  ctx.fill()

  // Janela do flash frontal e linha do grip lateral
  ctx.lineWidth = 3
  ctx.strokeRect(190, 70, 24, 16)
  ctx.beginPath()
  ctx.moveTo(50, 75)
  ctx.lineTo(50, 160)
  ctx.stroke()
}

/** Luminância de um pixel RGB normalizada em 0..1 (pesos clássicos). */
export function luminance(r: number, g: number, b: number): number {
  return (0.3 * r + 0.59 * g + 0.11 * b) / 255
}

/**
 * Cria o sampler a partir da silhueta. Precisa de `document` (canvas offscreen),
 * então deve ser chamado dentro de um efeito, nunca durante o render/SSR.
 * Mapeia o espaço normalizado do canvas visível para a imagem preservando o
 * aspect ratio (a câmera nunca fica achatada) e aplica uma leve distorção
 * analógica horizontal no tempo.
 */
export function createCameraSampler(): Sampler {
  const W = CAMERA_ART_WIDTH
  const H = CAMERA_ART_HEIGHT
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const octx = off.getContext('2d', { willReadFrequently: true })
  if (!octx) return () => 0
  drawCameraSilhouette(octx)
  const data = octx.getImageData(0, 0, W, H).data
  const imgAspect = W / H

  return (x, y, t, { aspect, wobble }) => {
    const sx = aspect >= 1 ? aspect : 1
    const sy = aspect >= 1 ? 1 : 1 / aspect
    let u = (x / sx + 1) / 2
    let v = (y / sy + 1) / 2
    if (aspect > imgAspect) u = (u - 0.5) * (aspect / imgAspect) + 0.5
    else v = (v - 0.5) * (imgAspect / aspect) + 0.5
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return 0

    const wob = wobble ? Math.sin(v * 30 + t * 2) * 0.0015 : 0
    const ix = Math.min(W - 1, Math.max(0, Math.floor((u + wob) * W)))
    const iy = Math.floor(v * H)
    const o = (iy * W + ix) * 4
    return luminance(data[o] ?? 0, data[o + 1] ?? 0, data[o + 2] ?? 0)
  }
}
