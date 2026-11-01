import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Events } from './collections/Events'
import { GalleryPhotos } from './collections/GalleryPhotos'
import { Media } from './collections/Media'
import { MenuCategories } from './collections/MenuCategories'
import { MenuItems } from './collections/MenuItems'
import { Reviews } from './collections/Reviews'
import { Users } from './collections/Users'
import { Announcement } from './globals/Announcement'
import { BusinessInfo } from './globals/BusinessInfo'
import { Story } from './globals/Story'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // No fixed serverURL: media URLs stay relative ("/api/media/…") so they work on any domain.
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Handworks Admin', icons: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
    components: {
      graphics: {
        Logo: '@/components/admin/Brand#Logo',
        Icon: '@/components/admin/Brand#Icon',
      },
      beforeDashboard: ['@/components/admin/Welcome#Welcome'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [MenuItems, MenuCategories, Events, Reviews, GalleryPhotos, Media, Users],
  globals: [BusinessInfo, Announcement, Story],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    // Local file in development; Turso in production. TURSO_* are set automatically by Vercel's Turso integration.
    client: {
      url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URI || 'file:./handworks.db',
      authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  upload: { limits: { fileSize: 20_000_000 } },
  sharp,
  plugins: [
    // Store uploads in Vercel Blob when deployed; on disk (./media) locally.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Keep the database schema identical locally (no Blob) and live (Blob), so migrations match.
      alwaysInsertFields: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      // Send uploads from the browser straight to Blob — Vercel limits server uploads to 4.5 MB.
      clientUploads: true,
    }),
  ],
})
