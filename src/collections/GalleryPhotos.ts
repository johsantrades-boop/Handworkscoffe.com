import type { CollectionConfig } from 'payload'

import { anyone, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const GalleryPhotos: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Gallery photo', plural: 'Gallery' },
  orderable: true,
  admin: {
    group: 'Photos',
    useAsTitle: 'caption',
    defaultColumns: ['photo', 'caption', 'hidden'],
    description: 'The photo wall on the homepage. Drag to reorder; the first 9 visible photos are shown.',
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Upload a new photo or pick one from the library.' },
    },
    {
      name: 'caption',
      type: 'text',
      required: true,
      admin: { description: 'Shown under the photo like a handwritten polaroid note.' },
    },
    { name: 'hidden', label: 'Hide from website', type: 'checkbox', defaultValue: false },
  ],
}
