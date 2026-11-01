'use client'
import { useEffect } from 'react'

const PHONE = '(max-width: 640px)'

/**
 * On phones the menu board folds into sections — only the first starts open — so it isn't one very long scroll.
 * Sections render open (so the full menu is there without JS and for search engines); on wider screens they stay open.
 */
export function MenuAccordion() {
  useEffect(() => {
    const sections = () => [...document.querySelectorAll<HTMLDetailsElement>('.board details.board__col')]
    const mq = window.matchMedia(PHONE)
    const apply = () => {
      sections().forEach((d, i) => {
        d.open = mq.matches ? i === 0 : true
      })
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return null
}
