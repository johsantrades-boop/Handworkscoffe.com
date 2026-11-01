import Link from 'next/link'
import type { Payload } from 'payload'

const tasks = [
  { href: '/admin/collections/menu-items', title: 'Update the menu', hint: 'Mark items sold out, seasonal, or add something new' },
  { href: '/admin/globals/business-info', title: 'Change hours', hint: 'Weekly hours, holidays and closing early' },
  { href: '/admin/globals/announcement', title: 'Post a notice', hint: 'Turn the top banner on or off' },
  { href: '/admin/collections/events/create', title: 'Add an event', hint: 'Pop-ups, seasonal drinks, collaborations' },
  { href: '/admin/collections/gallery/create', title: 'Add a photo', hint: 'Upload to the photo wall' },
  { href: '/admin/collections/reviews', title: 'Pick reviews', hint: 'Choose which reviews show and their order' },
]

export async function Welcome({ payload }: { payload: Payload }) {
  // A brand-new live site has an empty menu: offer to load the real starter content once.
  const { totalDocs } = await payload.count({ collection: 'menu-items' })
  return (
    <section className="hw-welcome">
      <p className="hw-welcome__eyebrow">Handworks Coffee Studio</p>
      {totalDocs === 0 ? (
        <form method="post" action="/setup/seed" className="hw-welcome__seed">
          <strong>This site is empty.</strong>
          <span>Load the starter menu, hours, story, reviews and photos? It takes about a minute.</span>
          <button type="submit" className="hw-welcome__seed-btn">
            Load starter content
          </button>
        </form>
      ) : null}
      <h2 className="hw-welcome__title">What would you like to do today?</h2>
      <p className="hw-welcome__lede">
        Changes you save appear on the website within a few seconds.{' '}
        <a href="/" target="_blank" rel="noreferrer">
          View the website ↗
        </a>
      </p>
      <ul className="hw-welcome__grid">
        {tasks.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="hw-welcome__card">
              <strong>{t.title}</strong>
              <span>{t.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
