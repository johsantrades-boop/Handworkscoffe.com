import { draftMode } from 'next/headers'

import { LocalBusinessJsonLd } from '@/components/site/JsonLd'
import { RefreshOnSave } from '@/components/site/RefreshOnSave'
import { Reveal } from '@/components/site/Reveal'
import {
  AnnouncementBar,
  EventsSection,
  Footer,
  GallerySection,
  MenuSection,
  ReviewsSection,
  StorySection,
  VisitSection,
} from '@/components/site/Sections'
import { SiteNav } from '@/components/site/SiteNav'
import { SmoothScroll } from '@/components/site/SmoothScroll'
import { WalkInHero } from '@/components/site/WalkInHero'
import { getSiteData } from '@/lib/site'

// Content edits refresh the page immediately (see cms/shared.ts); this is a safety net.
export const revalidate = 300

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode()
  const data = await getSiteData(draft)
  const { business } = data

  return (
    <>
      {draft ? (
        <>
          <RefreshOnSave />
          <a className="preview-pill" href="/preview/exit">
            Previewing unpublished changes · Exit
          </a>
        </>
      ) : null}
      <SiteNav>
        <AnnouncementBar data={data.announcement} />
      </SiteNav>
      <main>
        <WalkInHero name={business.name} tagline={business.tagline} street={business.street} />
        <StorySection story={data.story} />
        <MenuSection menu={data.menu} />
        <GallerySection gallery={data.gallery} instagram={business.instagram} />
        <ReviewsSection reviews={data.reviews} business={business} />
        <EventsSection events={data.events} instagram={business.instagram} />
        <VisitSection business={business} />
      </main>
      <Footer business={business} />
      <LocalBusinessJsonLd business={business} />
      <SmoothScroll />
      <Reveal />
    </>
  )
}
