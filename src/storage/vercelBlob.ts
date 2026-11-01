/**
 * Stores uploaded photos in a Vercel Blob store using Vercel's built-in (OIDC) sign-in.
 *
 * Newer Vercel Blob stores no longer come with a BLOB_READ_WRITE_TOKEN — connecting one to a project only adds
 * BLOB_STORE_ID, and the deployment proves who it is with a short-lived identity token. The official Payload
 * adapter still needs the old token, so this is a small replacement built on @vercel/blob ≥ 2.8.
 *
 * Files are stored privately and served through Payload's own `/api/media/file/…` route, so image URLs
 * work on every domain. Locally (no BLOB_STORE_ID) the plugin is off and uploads go to ./media.
 */
import { openAsBlob } from 'fs'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { buildStoragePathData, getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
import { BlobNotFoundError, del, get, put } from '@vercel/blob'
import type { Config, Plugin } from 'payload'

const CACHE_SECONDS = 60 * 60 * 24 * 365

const vercelBlobAdapter: Adapter = ({ collection, prefix: collectionPrefix = '' }) => ({
  name: 'vercel-blob-oidc',

  // Not used for display (Payload serves files through /api/media/file/…), but required by the plugin.
  generateURL: ({ filename, prefix = '' }) =>
    `/${buildStoragePathData({ collectionPrefix, docPrefix: prefix, filename }).storageFilePath}`,

  handleUpload: async ({ data, file, storageFilePath }) => {
    const body = file.tempFilePath ? await openAsBlob(file.tempFilePath) : file.buffer
    await put(storageFilePath, body, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: CACHE_SECONDS,
      contentType: file.mimeType,
    })
    return data
  },

  handleDelete: async ({ storageFilePath }) => {
    try {
      await del(storageFilePath)
    } catch (err) {
      if (!(err instanceof BlobNotFoundError)) throw err
    }
  },

  staticHandler: async (req, { doc, headers: incomingHeaders, params: { clientUploadContext, filename } }) => {
    try {
      const docPrefix = await getFilePrefix({ clientUploadContext, collection, collectionPrefix, doc, filename, req })
      const { storageFilePath } = buildStoragePathData({ collectionPrefix, docPrefix, filename })
      const result = await get(storageFilePath, {
        access: 'private',
        ifNoneMatch: req.headers.get('if-none-match') ?? undefined,
      })
      if (!result) return new Response(null, { status: 404, statusText: 'Not Found' })

      const headers = new Headers(incomingHeaders)
      headers.set('Cache-Control', `public, max-age=${CACHE_SECONDS}, immutable`)
      headers.set('ETag', result.blob.etag)
      if (result.statusCode === 304) return new Response(null, { headers, status: 304 })

      headers.set('Content-Type', result.blob.contentType)
      headers.set('Content-Length', String(result.blob.size))
      headers.set('Last-Modified', result.blob.uploadedAt.toUTCString())
      return new Response(result.stream, { headers, status: 200 })
    } catch (err) {
      if (err instanceof BlobNotFoundError) return new Response(null, { status: 404, statusText: 'Not Found' })
      req.payload.logger.error({ err, msg: 'Could not read image from Vercel Blob' })
      return new Response('Internal Server Error', { status: 500 })
    }
  },
})

/** Use Vercel Blob for these collections when a store is connected (BLOB_STORE_ID), otherwise local disk. */
export function vercelBlobStorage(collections: string[]): Plugin {
  const enabled = Boolean(process.env.BLOB_STORE_ID)
  return (incomingConfig: Config) => {
    const config: Config = enabled
      ? {
          ...incomingConfig,
          collections: (incomingConfig.collections ?? []).map((c) =>
            collections.includes(c.slug)
              ? { ...c, upload: { ...(typeof c.upload === 'object' ? c.upload : {}), disableLocalStorage: true } }
              : c,
          ),
        }
      : incomingConfig
    return cloudStoragePlugin({
      enabled,
      // Same database columns whether or not Blob is on, so local and live share migrations.
      alwaysInsertFields: true,
      collections: Object.fromEntries(collections.map((slug) => [slug, { adapter: enabled ? vercelBlobAdapter : null }])),
    })(config)
  }
}
