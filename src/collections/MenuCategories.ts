import type { CollectionConfig } from 'payload'

import { anyone, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  labels: { singular: 'Menu section', plural: 'Menu sections' },
  orderable: true,
  admin: {
    group: 'Menu',
    useAsTitle: 'name',
    defaultColumns: ['name', 'note', 'hidden'],
    description: 'The headings on the menu board (Coffee, Tea, …). Drag the handle on the left to reorder.',
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'note',
      type: 'text',
      admin: { description: 'Optional small note under the heading, e.g. "Weekends only".' },
    },
    {
      name: 'hidden',
      label: 'Hide this whole section from the website',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
