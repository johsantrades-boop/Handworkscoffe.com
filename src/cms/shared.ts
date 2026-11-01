import type { Access, CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// Anyone can read published content; signed-in editors also see drafts.
export const publishedOrEditor: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
export const editors: Access = ({ req: { user } }) => Boolean(user)

// The public site is cached; refresh it whenever content changes.
async function refreshSite() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next (e.g. the seed script) — nothing to refresh.
  }
}

export const refreshAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await refreshSite()
  return doc
}
export const refreshAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await refreshSite()
  return doc
}
export const refreshGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await refreshSite()
  return doc
}

// Half-hour time slots with friendly labels, stored as 24h "HH:MM".
export const timeOptions = Array.from({ length: 36 }, (_, i) => {
  const minutes = 5 * 60 + i * 30 // 5:00 a.m. → 10:30 p.m.
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const h12 = h % 12 === 0 ? 12 : h % 12
  const label = `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`
  return { label, value }
})

export const days = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
] as const

// Relative, so the admin's preview works on localhost, Vercel preview links and the real domain alike.
export const previewURL = (path: string) => `/preview?path=${encodeURIComponent(path)}`
