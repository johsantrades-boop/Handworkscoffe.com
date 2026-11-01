import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

// Signed-in editors land here from the admin's Preview button to see unpublished drafts.
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return new Response('Please sign in to the admin to preview changes.', { status: 403 })

  const path = new URL(req.url).searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
