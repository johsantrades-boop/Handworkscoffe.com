import config from '@payload-config'
import path from 'path'
import { getPayload } from 'payload'

import { seedContent } from '@/seed/content'

// Uploading and resizing the starter photos takes a little while.
export const maxDuration = 120

/**
 * One-time "Load starter content" for a fresh live site, posted from the admin dashboard.
 * Only signed-in admins can run it, and only while the menu is still empty — it never overwrites real content.
 */
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('Please sign in to the admin first.', { status: 403 })

  const { totalDocs } = await payload.count({ collection: 'menu-items' })
  if (totalDocs > 0) return new Response('The site already has content, so nothing was changed.', { status: 409 })

  await seedContent(payload, path.join(process.cwd(), 'src', 'seed', 'images'))
  return Response.redirect(new URL('/admin?seeded=1', req.url), 303)
}
