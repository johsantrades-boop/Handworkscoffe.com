'use client'
import { useEffect, useRef } from 'react'

import manifest from '../../../public/hero/manifest.json'
import { Logo } from './Logo'

type Props = { name: string; tagline?: string | null; street?: string | null }

type FrameSet = keyof typeof manifest

const frameUrl = (set: FrameSet, i: number) => `/hero/${set}/f${String(i + 1).padStart(3, '0')}.webp`

/** Desktop gets every frame; upright phones a lighter 9:16 crop; tablets and sideways phones a lighter landscape set. */
function pickFrameSet(): FrameSet {
  const touch = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
  if (!touch) return 'desktop'
  return window.innerHeight > window.innerWidth ? 'portrait' : 'mobile'
}

/** Visitors on Data Saver or a very slow connection get the still instead of ~1 MB of frames. */
function wantsLightweight() {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return Boolean(c?.saveData || c?.effectiveType === 'slow-2g' || c?.effectiveType === '2g')
}

/**
 * The "walk-in": a pinned canvas that plays the storefront video frame-by-frame as you scroll,
 * from the sidewalk, through the red door, to the counter — then washes into the paper of the next section.
 * Reduced motion and Data Saver get a still instead (handled in CSS via `hero-still`).
 */
export function WalkInHero({ name, tagline, street }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (wantsLightweight()) {
      document.documentElement.classList.add('hero-still')
      return
    }

    const set = pickFrameSet()
    const count = manifest[set]
    const focalX = set === 'portrait' ? 0.5 : 0.58
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frames: (HTMLImageElement | null)[] = new Array(count).fill(null)
    const state = { frame: 0 }
    let drawn = -1
    let disposed = false
    let cleanupGsap = () => {}

    let lastW = 0
    let lastH = 0
    const resize = () => {
      // Phones resize constantly as the address bar slides in and out; only re-size the canvas for real changes.
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === lastW && Math.abs(h - lastH) < 120) return
      lastW = w
      lastH = h
      const dpr = Math.min(window.devicePixelRatio || 1, set === 'desktop' ? 1.5 : 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      drawn = -1
      draw()
    }

    // Cover-fit, keeping the door (the focal point) in view.
    const paint = (img: HTMLImageElement) => {
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      const x = (cw - w) * focalX
      const y = (ch - h) / 2
      ctx.drawImage(img, x, y, w, h)
    }

    function draw() {
      const target = Math.round(state.frame)
      if (target === drawn) return
      // Use the nearest frame that has finished loading.
      for (let d = 0; d < count; d++) {
        const img = frames[target - d] ?? frames[target + d]
        if (img) {
          paint(img)
          drawn = target
          canvas!.dataset.ready = 'true'
          return
        }
      }
    }

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = frameUrl(set, i)
        img.onload = () => {
          img.decode().catch(() => {}).finally(() => {
            if (disposed) return resolve()
            frames[i] = img
            if (Math.round(state.frame) === i || drawn === -1) {
              drawn = -1
              draw()
            }
            resolve()
          })
        }
        img.onerror = () => resolve()
      })

    // First frame, then a coarse pass (every 4th) so scrubbing works early, then fill the gaps.
    ;(async () => {
      await load(0)
      const coarse = Array.from({ length: count }, (_, i) => i).filter((i) => i % 4 === 0 && i > 0)
      const rest = Array.from({ length: count }, (_, i) => i).filter((i) => i % 4 !== 0)
      for (const batch of [coarse, rest]) {
        for (let i = 0; i < batch.length; i += 6) {
          if (disposed) return
          await Promise.all(batch.slice(i, i + 6).map(load))
        }
      }
    })()

    resize()
    window.addEventListener('resize', resize)

    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (disposed) return
      gsap.registerPlugin(ScrollTrigger)
      const q = gsap.utils.selector(section)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: set === 'desktop' ? 0.9 : 0.4,
        },
      })
      tl.to(state, { frame: count - 1, duration: 0.9, onUpdate: draw }, 0)
        .to(q('.walkin__cue'), { autoAlpha: 0, duration: 0.05 }, 0)
        .to(q('.walkin__intro'), { autoAlpha: 0, y: -40, duration: 0.16 }, 0.02)
        .to(q('.walkin__jp'), { autoAlpha: 0, duration: 0.12 }, 0.04)
        .fromTo(q('.walkin__line--a'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.2)
        .to(q('.walkin__line--a'), { autoAlpha: 0, y: -24, duration: 0.07 }, 0.4)
        .fromTo(q('.walkin__line--b'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.55)
        .to(q('.walkin__line--b'), { autoAlpha: 0, y: -24, duration: 0.07 }, 0.74)
        .fromTo(q('.walkin__vignette'), { opacity: 0.85 }, { opacity: 0.35, duration: 0.6 }, 0.3)
        .fromTo(q('.walkin__wash'), { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.86)

      cleanupGsap = () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })()

    return () => {
      disposed = true
      window.removeEventListener('resize', resize)
      cleanupGsap()
    }
  }, [])

  return (
    <section ref={sectionRef} className="walkin" id="top" aria-label="Welcome to Handworks">
      <div className="walkin__stage">
        {/* Painted instantly; the canvas takes over once frames load. Also the reduced-motion still. */}
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet="/hero/inside.jpg" />
          <source media="(max-width: 767px) and (orientation: portrait)" srcSet="/hero/portrait/f001.webp" />
          <img className="walkin__poster" src="/hero/poster.jpg" alt="" fetchPriority="high" />
        </picture>
        <canvas ref={canvasRef} className="walkin__canvas" aria-hidden="true" />
        <div className="walkin__vignette" aria-hidden="true" />

        <div className="walkin__intro">
          <p className="walkin__eyebrow">
            <span>{street || '6th Street'}</span>
            <span aria-hidden="true">·</span>
            <span>Burnaby, B.C.</span>
          </p>
          <h1 className="walkin__title">
            <Logo className="walkin__logo" title={name} />
          </h1>
          {tagline ? <p className="walkin__tagline">{tagline}</p> : null}
        </div>

        {/* 手仕事 (teshigoto) — "handwork", set vertically like a shop sign. */}
        <p className="walkin__jp" lang="ja" aria-hidden="true">
          手仕事 · 珈琲
        </p>

        <p className="walkin__line walkin__line--a" aria-hidden="true">
          Look for the red door on 6th.
        </p>
        <p className="walkin__line walkin__line--b" aria-hidden="true">
          Come on in — take your time.
        </p>

        <a className="walkin__cue" href="#story">
          <span>Scroll to step inside</span>
          <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true">
            <path d="M7 1v19M1 14l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>

        <div className="walkin__wash" aria-hidden="true" />
      </div>
    </section>
  )
}
