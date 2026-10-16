import * as THREE from 'three'
import { PITCH } from '@/lib/match-data'

/**
 * Procedurally paints a night-match pitch (mowing stripes + full IFAB marking set)
 * onto a canvas so the scene ships with zero binary assets.
 */
export function createPitchTexture(): THREE.CanvasTexture {
  const W = 1400
  const H = 2048
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const mx = W / PITCH.width
  const mz = H / PITCH.length
  const px = (x: number) => (x + PITCH.halfWidth) * mx
  const pz = (z: number) => (z + PITCH.halfLength) * mz

  ctx.fillStyle = '#0F2E1D'
  ctx.fillRect(0, 0, W, H)

  const bands = 14
  const bandW = W / bands
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#123922' : '#0E2C1B'
    ctx.fillRect(i * bandW, 0, bandW + 1, H)
  }

  const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.08, W / 2, H / 2, H * 0.7)
  grd.addColorStop(0, 'rgba(255,255,255,0.06)')
  grd.addColorStop(1, 'rgba(0,0,0,0.42)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(240,255,245,0.82)'
  ctx.lineWidth = Math.max(3, mx * 0.12)
  ctx.lineJoin = 'round'

  const inset = 0
  ctx.strokeRect(px(-PITCH.halfWidth + inset), pz(-PITCH.halfLength + inset), PITCH.width * mx, PITCH.length * mz)

  ctx.beginPath()
  ctx.moveTo(px(-PITCH.halfWidth), pz(0))
  ctx.lineTo(px(PITCH.halfWidth), pz(0))
  ctx.stroke()

  const centreR = 9.15
  ctx.beginPath()
  ctx.arc(px(0), pz(0), centreR * mx, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(px(0), pz(0), mx * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(240,255,245,0.82)'
  ctx.fill()

  const drawEnd = (sign: 1 | -1) => {
    const goalLine = sign * PITCH.halfLength
    const boxDepth = 16.5 * sign
    const boxHalf = 20.16
    ctx.strokeRect(px(-boxHalf), pz(Math.min(goalLine, goalLine - boxDepth)), boxHalf * 2 * mx, 16.5 * mz)

    const gaDepth = 5.5 * sign
    const gaHalf = 9.16
    ctx.strokeRect(px(-gaHalf), pz(Math.min(goalLine, goalLine - gaDepth)), gaHalf * 2 * mx, 5.5 * mz)

    const spotZ = goalLine - sign * 11
    ctx.beginPath()
    ctx.arc(px(0), pz(spotZ), mx * 0.3, 0, Math.PI * 2)
    ctx.fill()

    const arcR = 9.15
    const arcZ = goalLine - sign * 11
    ctx.beginPath()
    if (sign === 1) {
      ctx.arc(px(0), pz(arcZ), arcR * mx, Math.PI * 0.15, Math.PI * 0.85)
    } else {
      ctx.arc(px(0), pz(arcZ), arcR * mx, Math.PI * 1.15, Math.PI * 1.85)
    }
    ctx.stroke()

    const corner = 1
    const cR = corner * mx
    const cx1 = px(-PITCH.halfWidth)
    const cx2 = px(PITCH.halfWidth)
    const cz = pz(goalLine)
    ctx.beginPath()
    ctx.arc(cx1, cz, cR, sign === 1 ? -Math.PI / 2 : 0, sign === 1 ? 0 : Math.PI / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx2, cz, cR, sign === 1 ? Math.PI : Math.PI * 1.5, sign === 1 ? Math.PI * 1.5 : Math.PI * 2)
    ctx.stroke()
  }
  drawEnd(1)
  drawEnd(-1)

  const goals = ctx.createLinearGradient(0, 0, 0, H)
  goals.addColorStop(0, 'rgba(0,0,0,0.5)')
  goals.addColorStop(0.12, 'rgba(0,0,0,0)')
  goals.addColorStop(0.88, 'rgba(0,0,0,0)')
  goals.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = goals
  ctx.fillRect(0, 0, W, H)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}
