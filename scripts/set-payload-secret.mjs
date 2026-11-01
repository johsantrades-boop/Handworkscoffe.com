// Generates a strong PAYLOAD_SECRET and saves it to the linked Vercel project (Production + Preview),
// replacing any existing value. The secret is never printed or written to disk.
// Usage (from handworks-site/, after `npx vercel login`): node scripts/set-payload-secret.mjs
import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import path from 'node:path'

const secret = randomBytes(32).toString('hex')
// Run from the project folder (where the Vercel link lives), whatever folder the terminal is in.
const cwd = path.resolve(import.meta.dirname, '..')
const vercel = (args, input) =>
  spawnSync('npx', ['--yes', 'vercel@latest', ...args], { cwd, input, encoding: 'utf8', shell: true })

console.log('Saving a new PAYLOAD_SECRET to Vercel… (about 30 seconds)')

for (const target of ['production', 'preview']) {
  vercel(['env', 'rm', 'PAYLOAD_SECRET', target, '--yes'])
  const added = vercel(['env', 'add', 'PAYLOAD_SECRET', target, '--sensitive', '--yes'], secret)
  if (added.status !== 0) {
    console.error(`Could not save PAYLOAD_SECRET for ${target}:\n${added.stderr || added.stdout}`)
    process.exit(1)
  }
  console.log(`✓ PAYLOAD_SECRET saved for ${target}`)
}
console.log('Done. Tell Claude it worked.')
