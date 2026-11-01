'use client'
import { useEffect, useState } from 'react'

import { Logo } from './Logo'

const links = [
  { href: '#story', label: 'Story' },
  { href: '#menu', label: 'Menu' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#events', label: 'Happenings' },
  { href: '#visit', label: 'Visit' },
]

export function SiteNav({ children }: { children?: React.ReactNode }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Turn the bar solid as the walk-in washes into paper (85% through the pinned scene).
    const hero = document.querySelector<HTMLElement>('.walkin')
    if (!hero) return
    const onScroll = () => {
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1)
      setSolid(-hero.getBoundingClientRect().top >= travel * 0.85)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="topbar">
    {children}
    <header className={`nav${solid ? ' nav--solid' : ''}${open ? ' nav--open' : ''}`}>
      <a href="#top" className="nav__brand" aria-label="Handworks Coffee Studio — back to top">
        <Logo variant="banner" className="nav__logo" title="Handworks" />
      </a>
      <button
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">Menu</span>
        <span aria-hidden="true" className="nav__toggle-bars" />
      </button>
      <nav id="nav-links" className="nav__links" aria-label="Sections">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
    </div>
  )
}
