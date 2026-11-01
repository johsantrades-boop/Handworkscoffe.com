import type { GlobalConfig } from 'payload'

import { anyone, previewURL, refreshGlobal } from '../cms/shared'

export const Story: GlobalConfig = {
  slug: 'story',
  label: 'Our story',
  admin: {
    group: 'Posts',
    description: 'The "Our Story" section. Changes save as a draft until you press Publish.',
    livePreview: { url: () => previewURL('/#story') },
    preview: () => previewURL('/#story'),
  },
  versions: { drafts: { autosave: { interval: 800 } }, max: 20 },
  access: { read: anyone },
  hooks: { afterChange: [refreshGlobal] },
  fields: [
    { name: 'eyebrow', label: 'Small label above the heading', type: 'text' },
    { name: 'heading', type: 'text', required: true },
    {
      name: 'paragraphs',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'signoff', label: 'Sign-off line', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'facts',
      label: 'Little facts',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Shown like typewritten tags, e.g. "Since — 2011".' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
