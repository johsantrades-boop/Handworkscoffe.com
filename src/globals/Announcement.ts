import type { GlobalConfig } from 'payload'

import { anyone, previewURL, refreshGlobal } from '../cms/shared'

export const Announcement: GlobalConfig = {
  slug: 'announcement',
  label: 'Announcement banner',
  admin: {
    group: 'Posts',
    description: 'A thin notice across the top of every page — e.g. "Closed early today" or "New fall menu".',
    livePreview: { url: () => previewURL('/') },
    preview: () => previewURL('/'),
  },
  versions: { drafts: { autosave: { interval: 800 } }, max: 20 },
  access: { read: anyone },
  hooks: { afterChange: [refreshGlobal] },
  fields: [
    { name: 'enabled', label: 'Show the banner', type: 'checkbox', defaultValue: false },
    { name: 'message', type: 'text', admin: { placeholder: 'Closed early today — back tomorrow at 10!' } },
    {
      name: 'tone',
      type: 'radio',
      defaultValue: 'warm',
      options: [
        { label: 'Warm (news, new menu)', value: 'warm' },
        { label: 'Alert (closures, changes)', value: 'alert' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      type: 'row',
      fields: [
        { name: 'linkLabel', label: 'Link text (optional)', type: 'text' },
        { name: 'linkUrl', label: 'Link (optional)', type: 'text' },
      ],
    },
    {
      name: 'hideAfter',
      label: 'Hide automatically after (optional)',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
