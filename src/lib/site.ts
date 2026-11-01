import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media } from '@/payload-types'
import { isoDay, nowInVancouver } from './hours'
import { relativeMediaUrl } from './url'

export const getBusinessInfo = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'business-info', depth: 1 })
})

/** Everything the homepage needs, fetched in parallel. `draft` shows unpublished changes in preview mode. */
export async function getSiteData(draft = false) {
  const payload = await getPayload({ config })
  const common = { draft, overrideAccess: draft } as const

  const [business, announcement, story, categories, items, events, reviews, gallery] = await Promise.all([
    getBusinessInfo(),
    payload.findGlobal({ slug: 'announcement', ...common }),
    payload.findGlobal({ slug: 'story', depth: 1, ...common }),
    payload.find({ collection: 'menu-categories', where: { hidden: { not_equals: true } }, sort: '_order', limit: 50, depth: 0 }),
    payload.find({ collection: 'menu-items', where: { hidden: { not_equals: true } }, sort: '_order', limit: 300, depth: 0 }),
    payload.find({ collection: 'events', where: { archived: { not_equals: true } }, sort: 'startDate', limit: 40, depth: 1, ...common }),
    payload.find({ collection: 'reviews', where: { show: { equals: true } }, sort: '_order', limit: 12, depth: 0 }),
    payload.find({ collection: 'gallery', where: { hidden: { not_equals: true } }, sort: '_order', limit: 9, depth: 1 }),
  ])

  const today = nowInVancouver().isoDate
  // Dated posts drop off the day after they end; undated ones (ongoing features) stay until archived.
  const upcoming = events.docs.filter((e) => {
    const last = e.endDate ?? e.startDate
    return !last || isoDay(last) >= today
  })

  const menu = categories.docs
    .map((cat) => ({
      ...cat,
      items: items.docs.filter((item) => (typeof item.category === 'object' ? item.category?.id : item.category) === cat.id),
    }))
    .filter((cat) => cat.items.length > 0)

  const showBanner =
    Boolean(announcement.enabled && announcement.message) &&
    (!announcement.hideAfter || new Date(announcement.hideAfter) > new Date())

  return {
    business,
    announcement: showBanner ? announcement : null,
    story,
    menu,
    events: upcoming,
    reviews: reviews.docs,
    gallery: gallery.docs,
  }
}

export type SiteData = Awaited<ReturnType<typeof getSiteData>>

/** Picks the best pre-resized copy of an uploaded image. */
export function imageSrc(media: unknown, size: 'thumbnail' | 'card' | 'large' = 'card') {
  if (!media || typeof media !== 'object') return null
  const m = media as Media
  return {
    src: relativeMediaUrl(m.sizes?.[size]?.url || m.url),
    srcSet: [
      m.sizes?.card?.url && `${relativeMediaUrl(m.sizes.card.url)} ${m.sizes.card.width}w`,
      m.sizes?.large?.url && `${relativeMediaUrl(m.sizes.large.url)} ${m.sizes.large.width}w`,
    ]
      .filter(Boolean)
      .join(', '),
    alt: m.alt || '',
    width: m.width ?? undefined,
    height: m.height ?? undefined,
    focal: `${m.focalX ?? 50}% ${m.focalY ?? 50}%`,
  }
}
