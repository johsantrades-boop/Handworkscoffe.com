// Turns the hero video into the image sequences used by the scroll-linked "walk-in".
// Usage: npm run frames -- "path/to/Hero Video.mp4"   (requires ffmpeg on PATH)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const input = path.resolve(process.argv[2] ?? path.join(root, '..', 'Hero Video.mp4'))
if (!existsSync(input)) {
  console.error(`Video not found: ${input}`)
  process.exit(1)
}

const ff = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, ...args], { stdio: 'inherit' })

const sets = [
  // Desktop: 15fps (plenty for scroll-scrubbing), 1280px wide.
  { name: 'desktop', vf: 'fps=15,scale=1280:-2', quality: 62 },
  // Tablets / phones held sideways: 5fps, 854px wide.
  { name: 'mobile', vf: 'fps=5,scale=854:-2', quality: 55 },
  // Phones held upright: a 9:16 crop that follows the door (60% across), 540x960 — sharper on a tall
  // screen than stretching a landscape frame, and fewer, lighter frames to keep memory low.
  { name: 'portrait', vf: 'fps=4.5,crop=ih*9/16:ih:(iw-ih*9/16)*0.6:0,scale=540:960', quality: 58 },
]

const manifest = {}
for (const set of sets) {
  const dir = path.join(root, 'public', 'hero', set.name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  ff('-an', '-vf', set.vf, '-c:v', 'libwebp', '-quality', String(set.quality), path.join(dir, 'f%03d.webp'))
  manifest[set.name] = readdirSync(dir).filter((f) => f.endsWith('.webp')).length
  console.log(`${set.name}: ${manifest[set.name]} frames`)
}
writeFileSync(path.join(root, 'public', 'hero', 'manifest.json'), JSON.stringify(manifest))

// Poster (first frame) for instant paint, and the "door open" still for reduced motion.
const stills = path.join(root, 'public', 'hero')
ff('-an', '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '4', path.join(stills, 'poster.jpg'))
ff('-an', '-ss', '7.2', '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '4', path.join(stills, 'inside.jpg'))

// Open Graph image (1200x630) from the storefront frame (the logo is added on top by scripts/build-logo.mjs).
ff('-an', '-ss', '3.4', '-frames:v', '1', '-vf', 'scale=1200:-2,crop=1200:630', '-q:v', '3', path.join(root, 'public', 'og-base.jpg'))

// Full-resolution stills used to seed the gallery.
const seedDir = path.join(root, 'src', 'seed', 'images')
mkdirSync(seedDir, { recursive: true })
for (const [t, name] of [
  [0.3, 'storefront'],
  [4.2, 'red-door'],
  [6.0, 'doorway'],
  [8.2, 'counter'],
  [10.0, 'inside'],
]) {
  ff('-an', '-ss', String(t), '-frames:v', '1', '-q:v', '3', path.join(seedDir, `${name}.jpg`))
}
console.log('Done.')
