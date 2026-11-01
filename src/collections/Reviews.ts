import type { CollectionConfig } from 'payload'

import { anyone, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  orderable: true,
  admin: {
    group: 'Posts',
    useAsTitle: 'author',
    defaultColumns: ['author', 'rating', 'show', 'when'],
    description:
      'Real customer reviews copied from Google. Tick "Show on website" for the ones you want, and drag to set the order.',
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
          admin: { description: 'First name and last initial, e.g. "Scott B."' },
        },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
        { name: 'when', label: 'When', type: 'text', admin: { placeholder: 'Summer 2026' } },
      ],
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      admin: { description: 'Paste the review exactly as written (you can shorten it with "…").' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'google',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'show', label: 'Show on website', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
