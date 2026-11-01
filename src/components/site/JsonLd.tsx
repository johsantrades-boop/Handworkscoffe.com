import type { SiteData } from '@/lib/site'
import { DAY_NAMES, isoDay, type DayKey } from '@/lib/hours'
import { siteUrl } from '@/lib/url'

/** schema.org CafeOrCoffeeShop data so search engines know the address and hours. */
export function LocalBusinessJsonLd({ business: b }: { business: SiteData['business'] }) {
  const url = siteUrl()
  const today = new Date().toISOString().slice(0, 10)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: b.name,
    description: b.description || undefined,
    url,
    image: `${url}/og.jpg`,
    telephone: b.phone || undefined,
    email: b.email || undefined,
    priceRange: '$',
    servesCuisine: ['Coffee', 'Japanese café'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.street,
      addressLocality: b.city,
      addressRegion: b.province,
      postalCode: b.postalCode,
      addressCountry: 'CA',
    },
    hasMap: b.googleMapsUrl || undefined,
    sameAs: [b.instagram, b.facebook].filter(Boolean),
    openingHoursSpecification: [
      ...(b.hours ?? [])
        .filter((h) => !h.closed && h.open && h.close)
        .map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${DAY_NAMES[h.day as DayKey]}`,
          opens: h.open,
          closes: h.close,
        })),
      ...(b.specialHours ?? [])
        .filter((s) => s.date && isoDay(s.date) >= today)
        .map((s) => ({
          '@type': 'OpeningHoursSpecification',
          validFrom: isoDay(s.date),
          validThrough: isoDay(s.date),
          opens: s.closed ? '00:00' : s.open,
          closes: s.closed ? '00:00' : s.close,
        })),
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
