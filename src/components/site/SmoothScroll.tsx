'use client'
import { useEffect } from 'react'

/** Lenis smooth scrolling on desktop only, wired into GSAP so the walk-in scrubs in step. */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    if (reduce || touch) return

    let destroy = () => {}
    let cancelled = false
    ;(async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -56 } })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      document.documentElement.classList.add('has-lenis')
      destroy = () => {
        gsap.ticker.remove(tick)
        lenis.destroy()
        document.documentElement.classList.remove('has-lenis')
      }
    })()
    return () => {
      cancelled = true
      destroy()
    }
  }, [])
  return null
}
