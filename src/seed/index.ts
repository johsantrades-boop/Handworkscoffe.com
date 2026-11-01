/**
 * Fills the local database with Handworks' real details: `npm run seed`.
 * On the live site, use the "Load starter content" button on the admin dashboard instead.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../payload.config'
import { seedContent } from './content'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const payload = await getPayload({ config })

if (process.env.NODE_ENV === 'production' && !process.env.SEED_FORCE) {
  payload.logger.error('Refusing to seed in production without SEED_FORCE=1 (it would replace live content).')
  process.exit(1)
}

// Local test admin from .env — never created in production, where the owner makes their own account.
const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env
if (email && password && process.env.NODE_ENV !== 'production') {
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!existing.docs.length) {
    await payload.create({ collection: 'users', data: { email, password, name: 'Handworks' } })
    payload.logger.info(`Created admin user ${email}`)
  }
}

await seedContent(payload, path.resolve(dirname, 'images'))
process.exit(0)
