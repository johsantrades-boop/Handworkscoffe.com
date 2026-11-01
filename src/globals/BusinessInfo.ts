import type { GlobalConfig } from 'payload'

import { anyone, days, refreshGlobal, timeOptions } from '../cms/shared'

export const BusinessInfo: GlobalConfig = {
  slug: 'business-info',
  label: 'Hours & contact',
  admin: {
    group: 'Settings',
    description: 'Opening hours, holiday hours, address and contact details shown across the site.',
  },
  access: { read: anyone },
  hooks: { afterChange: [refreshGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opening hours',
          fields: [
            {
              name: 'hours',
              label: 'Regular weekly hours',
              type: 'array',
              minRows: 7,
              maxRows: 7,
              admin: { initCollapsed: false, components: { RowLabel: '@/components/admin/DayRowLabel#DayRowLabel' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', type: 'select', required: true, options: [...days], admin: { width: '30%' } },
                    { name: 'closed', label: 'Closed all day', type: 'checkbox', admin: { width: '20%', style: { alignSelf: 'center' } } },
                    {
                      name: 'open',
                      type: 'select',
                      options: timeOptions,
                      admin: { width: '25%', condition: (_, row) => !row?.closed },
                    },
                    {
                      name: 'close',
                      type: 'select',
                      options: timeOptions,
                      admin: { width: '25%', condition: (_, row) => !row?.closed },
                    },
                  ],
                },
              ],
            },
            {
              name: 'specialHours',
              label: 'Holiday & special hours',
              type: 'array',
              labels: { singular: 'Special day', plural: 'Special days' },
              admin: {
                description:
                  'Add a date to override the regular hours — e.g. closed for a holiday or closing early. Past dates are ignored automatically.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'date',
                      type: 'date',
                      required: true,
                      admin: { width: '30%', date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' } },
                    },
                    { name: 'label', type: 'text', admin: { width: '30%', placeholder: 'e.g. Christmas Eve' } },
                    { name: 'closed', label: 'Closed', type: 'checkbox', admin: { width: '10%', style: { alignSelf: 'center' } } },
                    {
                      name: 'open',
                      type: 'select',
                      options: timeOptions,
                      admin: { width: '15%', condition: (_, row) => !row?.closed },
                    },
                    {
                      name: 'close',
                      type: 'select',
                      options: timeOptions,
                      admin: { width: '15%', condition: (_, row) => !row?.closed },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Address & contact',
          fields: [
            { name: 'name', label: 'Business name', type: 'text', required: true },
            { name: 'tagline', type: 'text', admin: { description: 'Short line shown in the opening scene.' } },
            {
              name: 'description',
              label: 'Search engine description',
              type: 'textarea',
              admin: { description: 'One or two sentences Google may show under your name in search results.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'street', type: 'text', required: true },
                { name: 'city', type: 'text', required: true },
                { name: 'province', type: 'text', required: true },
                { name: 'postalCode', type: 'text', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { placeholder: '604-000-0000' } },
                { name: 'email', type: 'email' },
              ],
            },
            {
              name: 'mapQuery',
              label: 'Map search text',
              type: 'text',
              admin: { description: 'What the embedded map searches for. Usually the business name and address.' },
            },
            { name: 'seatingNote', label: 'Small note under the address', type: 'text' },
          ],
        },
        {
          label: 'Social & reviews',
          fields: [
            { name: 'instagram', label: 'Instagram link', type: 'text' },
            { name: 'facebook', label: 'Facebook link', type: 'text' },
            { name: 'googleMapsUrl', label: 'Google Maps link', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'googleRating', label: 'Google rating', type: 'number', min: 1, max: 5 },
                { name: 'googleReviewCount', label: 'Number of Google reviews', type: 'number' },
              ],
            },
            {
              name: 'shareImage',
              label: 'Link preview image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Shown when the site is shared on social media or in messages (landscape works best).' },
            },
          ],
        },
      ],
    },
  ],
}
