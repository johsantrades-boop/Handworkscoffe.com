import type { CollectionConfig } from 'payload'

import { anyone, refreshAfterChange, refreshAfterDelete } from '../cms/shared'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: { singular: 'Menu item', plural: 'Menu items' },
  orderable: true,
  admin: {
    group: 'Menu',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'seasonal', 'soldOut', 'hidden', 'needsConfirming'],
    listSearchableFields: ['name', 'description'],
    description:
      'Drinks and food on the menu. Drag to reorder. Tick "Sold out" for the day, or "Hide" to take an item off the site without deleting it.',
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'category',
      label: 'Menu section',
      type: 'relationship',
      relationTo: 'menu-categories',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'One short line. Keep it simple — no prices on the website.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'seasonal', label: 'Seasonal', type: 'checkbox', defaultValue: false },
        { name: 'soldOut', label: 'Sold out', type: 'checkbox', defaultValue: false },
        { name: 'hidden', label: 'Hide from website', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'needsConfirming',
      label: 'Placeholder — needs confirming',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Added from an old or third-party source. Check it is still served, fix the description, untick this and "Hide from website".',
      },
    },
  ],
}
