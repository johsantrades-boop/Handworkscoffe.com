/**
 * The site's public address. Set NEXT_PUBLIC_SERVER_URL once you have a real domain;
 * until then Vercel's own production/preview address is used automatically.
 */
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/** Turns "http://any-host/api/media/file/x.webp" into "/api/media/file/x.webp" so images work on every domain. */
export function relativeMediaUrl(url?: string | null) {
  if (!url) return ''
  return url.replace(/^https?:\/\/[^/]+(?=\/api\/media\/)/, '')
}
