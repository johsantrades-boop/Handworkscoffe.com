import type { CollectionConfig } from 'payload'

import { anyone, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photo library' },
  admin: {
    group: 'Photos',
    description:
      'Every photo used on the site lives here. Uploads are resized automatically — just pick the best-looking original.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    {
      name: 'alt',
      label: 'Describe the photo',
      type: 'text',
      required: true,
      admin: {
        description: 'A short description for people using screen readers, e.g. "Hojicha latte on the front bench".',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    // Keep the original reasonably sized and serve resized WebP copies.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre', formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 900, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'large', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
  },
}
