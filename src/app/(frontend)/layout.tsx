import type { Metadata, Viewport } from 'next'
import { Courier_Prime, Fraunces, Shippori_Mincho, Work_Sans } from 'next/font/google'

import { getBusinessInfo, imageSrc } from '@/lib/site'
import { siteUrl } from '@/lib/url'
import './styles.css'

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  variable: '--font-display',
  display: 'swap',
})
const type = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-type', display: 'swap' })
const body = Work_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
// Japanese labels only. Not preloaded: Google serves it in unicode-range slices, so only the few glyphs we use download.
const jp = Shippori_Mincho({ weight: ['500', '700'], preload: false, variable: '--font-jp', display: 'swap' })


export async function generateMetadata(): Promise<Metadata> {
  const b = await getBusinessInfo()
  const title = `${b.name} · Japanese-inspired café in Burnaby, BC`
  const description =
    b.description ||
    'A tiny, family-run coffee studio behind a red door on 6th Street in Burnaby — Japanese lattes, matcha, hojicha and espresso, made by hand.'
  const share = imageSrc(b.shareImage, 'large')
  const ogImage = share?.src || '/og.jpg'
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      siteName: b.name,
      title,
      description,
      url: '/',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `The red door of ${b.name} on 6th Street` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    icons: { icon: '/favicon.svg' },
  }
}

export const viewport: Viewport = { themeColor: '#2a2420', colorScheme: 'light' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${type.variable} ${body.variable} ${jp.variable}`} suppressHydrationWarning>
      <head>
        {/* Lets CSS give the walk-in its scroll length only when JS can drive it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip" href="#story">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
