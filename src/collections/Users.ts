import type { CollectionConfig } from 'payload'

import { editors } from '../cms/shared'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin user', plural: 'Admin users' },
  admin: {
    group: 'Settings',
    useAsTitle: 'email',
    description: 'People who can sign in and edit the site.',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes after 5 wrong passwords
    tokenExpiration: 60 * 60 * 8, // stay signed in for a working day
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    read: editors,
    create: editors,
    update: editors,
    delete: editors,
  },
  fields: [{ name: 'name', type: 'text' }],
}
