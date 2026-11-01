import type { SiteData } from '@/lib/site'
import { imageSrc } from '@/lib/site'
import { HoursCard } from './HoursCard'
import { Logo } from './Logo'
import { MenuAccordion } from './MenuAccordion'

type Business = SiteData['business']

// Chapter markers pair the English label with a small Japanese one, like a kissaten menu card.
function Chapter({ n, jp, children }: { n: string; jp?: string; children: React.ReactNode }) {
  return (
    <p className="chapter">
      <span className="chapter__n">No. {n}</span>
      <span className="chapter__rule" aria-hidden="true" />
      <span>{children}</span>
      {jp ? (
        <span className="chapter__jp" lang="ja">
          {jp}
        </span>
      ) : null}
    </p>
  )
}

/** A noren — the split shop curtain you push through at the door. */
function Noren() {
  return (
    <div className="noren" aria-hidden="true">
      {['手', '仕', '事'].map((c, i) => (
        <span key={i} className="noren__panel" lang="ja" style={{ ['--i' as string]: i }}>
          {c}
        </span>
      ))}
    </div>
  )
}

function Stars({ rating, label = true }: { rating: number; label?: boolean }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className="stars" role="img" aria-label={label ? `${rating} out of 5 stars` : undefined} aria-hidden={label ? undefined : true}>
      {'★'.repeat(r)}
      <span className="stars__off">{'★'.repeat(5 - r)}</span>
    </span>
  )
}

export function AnnouncementBar({ data }: { data: SiteData['announcement'] }) {
  if (!data) return null
  return (
    <div className={`announce announce--${data.tone ?? 'warm'}`} role="status">
      <p>
        {data.message}
        {data.linkUrl ? (
          <>
            {' '}
            <a href={data.linkUrl}>{data.linkLabel || 'Details'} →</a>
          </>
        ) : null}
      </p>
    </div>
  )
}

export function StorySection({ story }: { story: SiteData['story'] }) {
  const photo = imageSrc(story.photo, 'large')
  return (
    <section id="story" className="section story" aria-labelledby="story-title">
      <Noren />
      <div className="wrap story__grid">
        <div className="story__text" data-reveal>
          <Chapter n="01" jp="いらっしゃいませ">
            {story.eyebrow || 'Our story'}
          </Chapter>
          <h2 id="story-title" className="display">
            {story.heading}
          </h2>
          <div className="story__body">
            {story.paragraphs?.map((p, i) => (
              <p key={p.id ?? i}>{p.text}</p>
            ))}
          </div>
          {story.signoff ? <p className="story__signoff">{story.signoff}</p> : null}
        </div>
        <figure className="story__photo" data-reveal>
          {photo ? (
            <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 900px) 40vw, 90vw" alt={photo.alt} loading="lazy" style={{ objectPosition: photo.focal }} />
          ) : null}
          <span className="tape tape--tl" aria-hidden="true" />
          <span className="tape tape--br" aria-hidden="true" />
          {photo?.alt ? <figcaption>{photo.alt}</figcaption> : null}
        </figure>
        {story.facts?.length ? (
          <ul className="facts" data-reveal>
            {story.facts.map((f, i) => (
              <li key={f.id ?? i}>
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

export function MenuSection({ menu }: { menu: SiteData['menu'] }) {
  const hasSeasonal = menu.some((c) => c.items.some((i) => i.seasonal))
  return (
    <section id="menu" className="section menu" aria-labelledby="menu-title">
      <div className="wrap">
        <div className="section__head" data-reveal>
          <Chapter n="02" jp="お品書き">
            The board
          </Chapter>
          <h2 id="menu-title" className="display">
            What we’re pouring
          </h2>
          <p className="lede">Everything made by hand, one cup at a time. Ask us about today’s beans.</p>
        </div>
        <div className="board" data-reveal>
          <div className="board__inner">
            {menu.map((cat) => (
              // <details> so phones can fold sections away (MenuAccordion); always open on larger screens.
              <details key={cat.id} className="board__col" open>
                <summary className="board__cat">
                  <h3>{cat.name}</h3>
                </summary>
                {cat.note ? <p className="board__note">{cat.note}</p> : null}
                <ul>
                  {cat.items.map((item) => (
                    <li key={item.id} className={item.soldOut ? 'is-soldout' : undefined}>
                      <p className="board__item">
                        <span className="board__name">{item.name}</span>
                        {item.seasonal ? (
                          <span className="seal" lang="ja" title="Seasonal">
                            季<span className="sr-only"> (seasonal)</span>
                          </span>
                        ) : null}
                        {item.soldOut ? <span className="stamp">Sold out</span> : null}
                      </p>
                      {item.description ? <p className="board__desc">{item.description}</p> : null}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          <MenuAccordion />
          {hasSeasonal ? (
            <p className="board__legend">
              <span className="seal seal--light" lang="ja" aria-hidden="true">
                季
              </span>{' '}
              seasonal (<i lang="ja-Latn">kisetsu</i>) — here while it lasts
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function GallerySection({ gallery, instagram }: { gallery: SiteData['gallery']; instagram?: string | null }) {
  if (!gallery.length) return null
  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="section__head section__head--split" data-reveal>
          <div>
            <Chapter n="03" jp="写真">
              Around the room
            </Chapter>
            <h2 id="gallery-title" className="display">
              Little things, kept with care
            </h2>
          </div>
          {instagram ? (
            <a className="btn btn--ghost" href={instagram} target="_blank" rel="noreferrer">
              Follow @hwcsburnaby
            </a>
          ) : null}
        </div>
        <ul className="polaroids">
          {gallery.map((g, i) => {
            const img = imageSrc(g.photo, 'card')
            if (!img) return null
            return (
              <li key={g.id} className="polaroid" style={{ ['--tilt' as string]: `${[-2.2, 1.6, -0.8, 2.4, -1.6, 0.9][i % 6]}deg` }} data-reveal>
                <figure>
                  <div className="polaroid__img">
                    <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 900px) 30vw, 90vw" alt={img.alt} loading="lazy" style={{ objectPosition: img.focal }} />
                  </div>
                  <figcaption>{g.caption}</figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function ReviewsSection({ reviews, business }: { reviews: SiteData['reviews']; business: Business }) {
  if (!reviews.length) return null
  return (
    <section id="reviews" className="section reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="section__head section__head--split" data-reveal>
          <div>
            <Chapter n="04" jp="お客様の声">
              Kind words
            </Chapter>
            <h2 id="reviews-title" className="display">
              From the regulars
            </h2>
          </div>
          {business.googleRating ? (
            <div className="rating">
              <span className="rating__num">{business.googleRating.toFixed(1)}</span>
              <span>
                <Stars rating={business.googleRating} />
                <span className="rating__count">
                  {business.googleReviewCount ? `${business.googleReviewCount} Google reviews` : 'on Google'}
                </span>
              </span>
            </div>
          ) : null}
        </div>
        <p className="cards__hint" aria-hidden="true">
          Swipe for more →
        </p>
        <ul className="cards" tabIndex={0} aria-label="Customer reviews">
          {/* tabIndex lets keyboard users scroll the swipeable row on phones. */}
          {reviews.map((r) => (
            <li key={r.id} className="card" data-reveal>
              <Stars rating={r.rating} />
              <blockquote>
                <p>{r.quote}</p>
              </blockquote>
              <p className="card__by">
                — {r.author}
                <span>
                  {r.source === 'google' ? 'Google' : r.source === 'yelp' ? 'Yelp' : ''}
                  {r.when ? ` · ${r.when}` : ''}
                </span>
              </p>
            </li>
          ))}
        </ul>
        {business.googleMapsUrl ? (
          <p className="reviews__more">
            <a href={business.googleMapsUrl} target="_blank" rel="noreferrer">
              Read every review on Google →
            </a>
          </p>
        ) : null}
      </div>
    </section>
  )
}

const kindLabel: Record<string, string> = {
  event: 'Event',
  seasonal: 'Seasonal',
  collab: 'Collaboration',
  spotlight: 'Spotlight',
}

export function EventsSection({ events, instagram }: { events: SiteData['events']; instagram?: string | null }) {
  return (
    <section id="events" className="section events" aria-labelledby="events-title">
      <div className="wrap">
        <div className="section__head" data-reveal>
          <Chapter n="05" jp="お知らせ">
            On the calendar
          </Chapter>
          <h2 id="events-title" className="display">
            Happenings &amp; features
          </h2>
        </div>
        {events.length ? (
          <ul className="stubs">
            {events.map((e) => {
              const img = imageSrc(e.image, 'card')
              const d = e.startDate ? new Date(e.startDate) : null
              return (
                <li key={e.id} className="stub" data-reveal>
                  <div className="stub__date" aria-hidden={d ? undefined : true}>
                    {d ? (
                      <time dateTime={d.toISOString().slice(0, 10)}>
                        <span>{d.toLocaleDateString('en-CA', { month: 'short', timeZone: 'UTC' })}</span>
                        <strong>{d.toLocaleDateString('en-CA', { day: 'numeric', timeZone: 'UTC' })}</strong>
                      </time>
                    ) : (
                      <span className="stub__ongoing">Now on</span>
                    )}
                  </div>
                  <div className="stub__body">
                    <p className="stub__kind">
                      {kindLabel[e.kind] ?? e.kind}
                      {e.timeLabel ? ` · ${e.timeLabel}` : ''}
                      {e.endDate && d
                        ? ` · until ${new Date(e.endDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
                        : ''}
                    </p>
                    <h3>{e.title}</h3>
                    <p>{e.summary}</p>
                    {e.linkUrl ? (
                      <a className="stub__link" href={e.linkUrl}>
                        {e.linkLabel || 'Find out more'} →
                      </a>
                    ) : null}
                  </div>
                  {img ? (
                    <div className="stub__img">
                      <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.focal }} />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="events__empty" data-reveal>
            Nothing on the calendar just now.{' '}
            {instagram ? (
              <a href={instagram} target="_blank" rel="noreferrer">
                Follow along on Instagram
              </a>
            ) : null}{' '}
            for pop-ups and seasonal drinks.
          </p>
        )}
      </div>
    </section>
  )
}

export function VisitSection({ business }: { business: Business }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    business.mapQuery || `${business.name}, ${business.street}, ${business.city}`,
  )}&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${business.name}, ${business.street}, ${business.city}, ${business.province} ${business.postalCode}`,
  )}`
  return (
    <section id="visit" className="section visit" aria-labelledby="visit-title">
      <div className="wrap visit__grid">
        <div className="visit__info" data-reveal>
          <Chapter n="06" jp="アクセス">
            Find us
          </Chapter>
          <h2 id="visit-title" className="display">
            Come say hello
          </h2>
          <address className="visit__address">
            {business.street}
            <br />
            {business.city}, {business.province} {business.postalCode}
          </address>
          {business.seatingNote ? <p className="visit__note">{business.seatingNote}</p> : null}
          <HoursCard hours={business.hours ?? []} specialHours={business.specialHours ?? []} />
          <ul className="contact">
            {business.phone ? (
              <li>
                <span className="label">Phone</span>
                <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>
              </li>
            ) : null}
            {business.email ? (
              <li>
                <span className="label">Email</span>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </li>
            ) : null}
            {business.instagram ? (
              <li>
                <span className="label">Instagram</span>
                <a href={business.instagram} target="_blank" rel="noreferrer">
                  @hwcsburnaby
                </a>
              </li>
            ) : null}
            {business.facebook ? (
              <li>
                <span className="label">Facebook</span>
                <a href={business.facebook} target="_blank" rel="noreferrer">
                  Handworks Coffee Studio
                </a>
              </li>
            ) : null}
          </ul>
          <a className="btn" href={directions} target="_blank" rel="noreferrer">
            Get directions
          </a>
        </div>
        <div className="visit__map" data-reveal>
          <iframe title={`Map showing ${business.name}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  )
}

export function Footer({ business }: { business: Business }) {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Logo className="footer__logo" title={business.name} />
          <p className="footer__jp" lang="ja">
            手仕事のコーヒー
          </p>
        </div>
        <div>
          <p className="label">Visit</p>
          <p>
            {business.street}
            <br />
            {business.city}, {business.province} {business.postalCode}
          </p>
        </div>
        <div>
          <p className="label">Say hi</p>
          <p>
            {business.phone ? (
              <>
                <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>
                <br />
              </>
            ) : null}
            {business.email ? (
              <>
                <a href={`mailto:${business.email}`}>{business.email}</a>
                <br />
              </>
            ) : null}
            {business.instagram ? (
              <a href={business.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
            {business.facebook ? (
              <>
                {' · '}
                <a href={business.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
      <div className="wrap footer__base">
        <p>
          © {new Date().getFullYear()} {business.name}. Made by hand in Burnaby.
        </p>
        <a href="/admin" className="footer__admin">
          Admin
        </a>
      </div>
    </footer>
  )
}
