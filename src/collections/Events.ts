import type { CollectionConfig } from 'payload'

import { previewURL, publishedOrEditor, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event or feature', plural: 'Events & features' },
  admin: {
    group: 'Posts',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'startDate', 'archived', '_status'],
    description:
      'Pop-ups, seasonal drinks, collaborations and spotlights. Posts with a date disappear from the site by themselves once the date has passed.',
    livePreview: { url: () => previewURL('/#events') },
    preview: () => previewURL('/#events'),
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 20 },
  access: { read: publishedOrEditor },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  defaultSort: '-startDate',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'kind',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: 'event',
      options: [
        { label: 'Event / pop-up', value: 'event' },
        { label: 'Seasonal drink', value: 'seasonal' },
        { label: 'Collaboration', value: 'collab' },
        { label: 'Spotlight', value: 'spotlight' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          label: 'Date',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
            description: 'Leave empty for something ongoing (e.g. a seasonal drink).',
          },
        },
        {
          name: 'endDate',
          label: 'Ends (optional)',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' } },
        },
        {
          name: 'timeLabel',
          label: 'Time (optional)',
          type: 'text',
          admin: { placeholder: 'e.g. 10 a.m. – 2 p.m.' },
        },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'summary', type: 'textarea', required: true, admin: { description: 'Two or three sentences.' } },
    {
      type: 'row',
      fields: [
        { name: 'linkLabel', label: 'Button text (optional)', type: 'text', admin: { placeholder: 'More on Instagram' } },
        { name: 'linkUrl', label: 'Button link (optional)', type: 'text' },
      ],
    },
    {
      name: 'archived',
      label: 'Archive (hide from the website but keep it)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
