'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/** In preview mode, re-render the page whenever the editor autosaves in the admin. */
export function RefreshOnSave() {
  const router = useRouter()
  // The admin and the site share an origin, whichever domain we're on.
  const [origin, setOrigin] = useState<string | null>(null)
  useEffect(() => setOrigin(window.location.origin), [])
  if (!origin) return null
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />
}
