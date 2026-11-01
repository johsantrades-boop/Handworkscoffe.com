// Rebuilds the Handworks window-decal logo as clean vector artwork.
// Usage: npm run logo
//
// Matches the decal on the shop window: "HANDWORKS" cut out of a slanted black banner (the O is a
// coffee drip), "COFFEE STUDIO" in thin spaced caps beneath, a small arrow flourish, and "EST 2011".
// Text is converted to paths so the logo looks identical everywhere (site, admin, favicon, share image).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const require = createRequire(import.meta.url)
const font = (pkg, file) => {
  const buf = readFileSync(require.resolve(`@fontsource/${pkg}/files/${file}`))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}

const bold = font('big-shoulders-display', 'big-shoulders-display-latin-500-normal.woff')
const thin = font('big-shoulders-display', 'big-shoulders-display-latin-400-normal.woff')

const INK = '#1f1a17'
const PAPER = '#f4ecdd'
const r = (n) => Math.round(n * 100) / 100

/**
 * Lays out a string glyph by glyph with extra tracking; returns path data and the width used.
 * `widen` stretches each glyph horizontally — the decal's letters are wider than Big Shoulders.
 */
function setText(f, text, x, baseline, capHeight, tracking = 0, widen = 1) {
  const size = capHeight / (f.tables.os2.sCapHeight / f.unitsPerEm)
  let cursor = x
  const parts = []
  for (const ch of text) {
    if (ch === ' ') {
      cursor += size * 0.28 * widen + tracking
      continue
    }
    const glyph = f.charToGlyph(ch)
    const p = glyph.getPath(cursor, baseline, size)
    for (const c of p.commands) {
      for (const k of ['x', 'x1', 'x2']) if (k in c) c[k] = cursor + (c[k] - cursor) * widen
    }
    parts.push(p.toPathData(2))
    cursor += (glyph.advanceWidth / f.unitsPerEm) * size * widen + tracking
  }
  return { d: parts.join(''), width: cursor - x - tracking }
}

// ---------------------------------------------------------------- Layout (viewBox 0 0 700 330)
const W = 700
const capH = 104
const baseline = 172
const capTop = baseline - capH

// Measure the two text runs either side of the hand-drawn O, then fit them inside the banner.
const oWidth = capH * 0.62
const widen = 1.38
const left0 = setText(bold, 'HANDW', 0, baseline, capH, 0, widen)
const right0 = setText(bold, 'RKS', 0, baseline, capH, 0, widen)
const gap = 6
const tracking = (604 - (left0.width + right0.width + oWidth + gap * 2)) / 7 // 7 gaps inside HANDW + RKS
const startX = 50
const left = setText(bold, 'HANDW', startX, baseline, capH, tracking, widen)
const oX = startX + left.width + gap + tracking / 2
const right = setText(bold, 'RKS', oX + oWidth + gap + tracking / 2, baseline, capH, tracking, widen)

// The O: a ring with a little stem above and a coffee drip falling to the baseline.
const ringR = capH * 0.25
const stroke = capH * 0.1
const cx = oX + oWidth / 2
const cy = capTop + capH * 0.5
const ring = [
  `M${r(cx - ringR - stroke / 2)} ${r(cy)}`,
  `a${r(ringR + stroke / 2)} ${r(ringR + stroke / 2)} 0 1 0 ${r(2 * (ringR + stroke / 2))} 0`,
  `a${r(ringR + stroke / 2)} ${r(ringR + stroke / 2)} 0 1 0 ${r(-2 * (ringR + stroke / 2))} 0Z`,
  `M${r(cx - ringR + stroke / 2)} ${r(cy)}`,
  `a${r(ringR - stroke / 2)} ${r(ringR - stroke / 2)} 0 1 1 ${r(2 * (ringR - stroke / 2))} 0`,
  `a${r(ringR - stroke / 2)} ${r(ringR - stroke / 2)} 0 1 1 ${r(-2 * (ringR - stroke / 2))} 0Z`,
].join('')
const stemW = stroke * 0.8
const stemTop = capTop + 2
const stemBottom = cy - ringR - stroke / 2 - 5
const stem = `M${r(cx - stemW / 2)} ${r(stemTop)}h${r(stemW)}v${r(stemBottom - stemTop)}h${r(-stemW)}Z`
const dropTop = cy + ringR + stroke / 2 + 5
const dropR = stroke * 0.62
const drop = `M${r(cx)} ${r(dropTop)}C${r(cx + dropR * 0.4)} ${r(dropTop + 6)} ${r(cx + dropR)} ${r(baseline - dropR * 1.6)} ${r(cx + dropR)} ${r(baseline - dropR)}a${r(dropR)} ${r(dropR)} 0 0 1 ${r(-2 * dropR)} 0C${r(cx - dropR)} ${r(baseline - dropR * 1.6)} ${r(cx - dropR * 0.4)} ${r(dropTop + 6)} ${r(cx)} ${r(dropTop)}Z`

const word = left.d + right.d + ring + stem + drop

// Banner: slanted left edge, bottom edge rising gently to the right — like the decal.
const banner = 'M30 48L688 40L688 186Q372 200 14 214Z'
// The lettering sits slightly tilted with the banner.
const tilt = 'rotate(-1.4 350 130)'

// "COFFEE STUDIO" and "EST 2011"
const subCap = 46
const subBaseline = 282
const subW = 500
const sub0 = setText(thin, 'COFFEE STUDIO', 0, subBaseline, subCap, 0, 1.25)
const subTracking = (subW - sub0.width) / 12
const subtitle = setText(thin, 'COFFEE STUDIO', (W - subW) / 2, subBaseline, subCap, subTracking, 1.25)
const est = setText(thin, 'EST 2011', 40, 34, 13, 3)

// Flourish: a hairline with a small chevron in the middle and tiny hooks at each end.
const oy = 312
const ornament = `M262 ${oy}H342l8 6 8-6H438M262 ${oy}l7-4M438 ${oy}l-7 4`

const viewBox = `0 0 ${W} 330`
const data = { viewBox, banner, word, tilt, subtitle: subtitle.d, est: est.d, ornament }

mkdirSync(path.join(root, 'src', 'components', 'site'), { recursive: true })
writeFileSync(path.join(root, 'src', 'components', 'site', 'logo-data.json'), JSON.stringify(data))

// ---------------------------------------------------------------- Static files
/** Full lockup. `banner` is the banner colour; the letters are true cut-outs so the background shows through. */
const lockup = ({ banner: bannerFill, text }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="Handworks Coffee Studio">
<defs><mask id="cut" maskUnits="userSpaceOnUse"><rect width="${W}" height="330" fill="#fff"/><path transform="${tilt}" d="${word}" fill="#000"/></mask></defs>
<path d="${est.d}" fill="${text}"/>
<path d="${banner}" fill="${bannerFill}" mask="url(#cut)"/>
<path d="${subtitle.d}" fill="${text}"/>
<path d="${ornament}" fill="none" stroke="${text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
writeFileSync(path.join(root, 'public', 'logo.svg'), lockup({ banner: INK, text: INK }))
writeFileSync(path.join(root, 'public', 'logo-light.svg'), lockup({ banner: PAPER, text: PAPER }))

// Favicon: the drip-O on an ink tile.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(cx - 62)} ${r(cy - 62)} 124 124">
<rect x="${r(cx - 62)}" y="${r(cy - 62)}" width="124" height="124" rx="18" fill="${INK}"/>
<path d="${ring + stem + drop}" fill="${PAPER}" transform="translate(${r(cx)} ${r(cy)}) scale(1.35) translate(${r(-cx)} ${r(-cy)})"/>
</svg>
`
writeFileSync(path.join(root, 'public', 'favicon.svg'), favicon)

// Share image: storefront still, warmed and darkened, with the light logo on top.
const og = path.join(root, 'public', 'og-base.jpg')
const logoPng = await sharp(Buffer.from(lockup({ banner: PAPER, text: PAPER })), { density: 220 })
  .resize({ width: 760 })
  .png()
  .toBuffer()
await sharp(og)
  .modulate({ brightness: 0.62, saturation: 0.85 })
  .composite([{ input: logoPng, gravity: 'center' }])
  .jpeg({ quality: 84 })
  .toFile(path.join(root, 'public', 'og.jpg'))

console.log('Logo written: public/logo.svg, public/logo-light.svg, public/favicon.svg, public/og.jpg')
