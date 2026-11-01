# Handworks Coffee Studio — website & admin

A one-page, scroll-driven site for Handworks Coffee Studio (7705 6th St, Burnaby BC) with a built-in admin
so the café can update the menu, hours, posts, photos and reviews without touching code.

- **Site:** Next.js 16 (App Router), GSAP ScrollTrigger + Lenis for the walk-in hero, hand-written CSS
- **Admin / content:** Payload CMS 3, running inside the same Next.js app at `/admin`
- **Database:** SQLite file locally; any libSQL/Turso database in production
- **Images:** resized automatically by Payload (`sharp`) into WebP sizes; stored on disk locally, or in Vercel Blob
  in production (`src/storage/vercelBlob.ts`)

---

## 1. Run it on your computer

Requires **Node.js 22.23+ or 24.22+** and npm. `ffmpeg` is only needed if you replace the hero video.

```bash
npm install
```

```bash
cp .env.example .env
```

Open `.env` and set `PAYLOAD_SECRET` to a long random string. To have the seed create your first admin
account, also set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

```bash
npm run seed
```

```bash
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin (or the small **Admin** link in the footer)

If you skipped the seed admin, the first visit to `/admin` asks you to create the first account.

> `npm run seed` loads the real Handworks content (hours, menu board, Google reviews, story, photos).
> It **replaces** existing menu, reviews, gallery and events, so only run it on a fresh database.

## 2. Logging into the admin

Go to `/admin` and sign in with your email and password. After 5 wrong passwords the account locks for
15 minutes. Add more people under **Settings → Admin users**. "Forgot password" emails need an email
adapter (see *Optional extras*); until then, another admin can reset a password from the Admin users list.

What the owner can do (the dashboard has shortcuts for each):

| Task | Where |
| --- | --- |
| Mark an item **sold out**, **seasonal**, or hide it | Menu → Menu items (tick the boxes, Save) |
| Add / rename / reorder / hide menu sections | Menu → Menu sections (drag the ⋮⋮ handle to reorder) |
| Change weekly hours, add **holiday / special hours** | Settings → Hours & contact → Opening hours |
| Address, phone, email, Instagram, Facebook | Settings → Hours & contact |
| Turn the **announcement banner** on/off | Posts → Announcement banner (tick "Show the banner", Publish) |
| Create, schedule, archive **events & features** | Posts → Events & features |
| Pick which **reviews** show, and their order | Posts → Reviews |
| Edit the **Our Story** text and photo | Posts → Our story |
| Upload / reorder / remove **gallery** photos | Photos → Gallery |

**Previewing before publishing:** Events, the Story and the Announcement save as drafts while you type. Use
the **Live Preview** tab (phone/tablet/desktop sizes) or **Preview** to see the real page, then press
**Publish**. Everything else goes live when you press **Save**. The public page refreshes within seconds.

Dated events disappear from the site the day after they end; undated ones ("Now on") stay until archived.
Today's hours are highlighted automatically using Vancouver time, including any special-hours override.

## 3. Deploying (Vercel + Turso)

Everything is configured for Vercel. `vercel.json` makes each deploy apply database migrations, then
build. `.vercelignore` keeps `.env`, the local database and local uploads from ever being uploaded.
Run the commands from inside `handworks-site/`.

The live site is the Vercel project **handworkscoffe.com**. It's connected to the GitHub repo, so **every push
to `main` deploys automatically**. Don't use "Add New Project → Import" again: that creates a second, empty
project whose builds fail with "missing secret key".

Setting it up from scratch:

1. **Project:** in Vercel, **Add New → Project → Import** the GitHub repo, once only.
2. **Database:** in **Storage → Create → Turso** (free plan), connect it to the project for Production and
   Preview. Depending on the prefix you choose, it sets `TURSO_DATABASE_URL` plus `TURSO_AUTH_TOKEN` (or
   `TURSO_DATABASE_TURSO_AUTH_TOKEN`). The site accepts either.
3. **Images:** in **Storage → Create → Blob** (Private is fine), connect it to the project. This sets
   `BLOB_STORE_ID`. New Vercel stores sign in automatically (OIDC) and no longer create a
   `BLOB_READ_WRITE_TOKEN`; `src/storage/vercelBlob.ts` handles that. Photo uploads are limited to 4.4 MB,
   Vercel's per-request limit, and most phone photos fit.
4. **Login secret:** in **Settings → Environment Variables**, add `PAYLOAD_SECRET` for Production and Preview,
   marked Sensitive. Use a long random value, which you can generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. **Deploy:** push to `main`, or press **Redeploy** on the latest deployment.
6. **Create the admin account straight away** at `https://<your-site>/admin`. The first visitor gets the
   "create first user" form.
7. **Load the starter content.** On the admin dashboard of a fresh site, press **Load starter content**.
   It fills in the menu, hours, story, reviews, events and photos (about a minute). The button only appears
   while the menu is empty and only works for signed-in admins, so it can never overwrite real content.
   Photos you uploaded in your local admin aren't copied, so upload them again in the live admin.

The site uses Vercel's address automatically. When you add a custom domain (Project → Settings → Domains),
also set `NEXT_PUBLIC_SERVER_URL=https://yourdomain.ca` and redeploy, so share links and search data use it.

Any Node host works too (Railway, Render, a VPS with `npm run ci && npm start`). With a persistent disk you
can keep `DATABASE_URI=file:./handworks.db` and skip Blob, so uploads are saved to `./media`. Instead of the
`TURSO_*` names you can also set `DATABASE_URI` and `DATABASE_AUTH_TOKEN`.

**After changing content fields in code**, run `npm run payload -- migrate:create <name>` and commit the new
migration. Production applies it on the next deploy.

## 4. How the walk-in hero works

`scripts/extract-frames.mjs` turns the storefront video into image sequences in `public/hero/`:

- `desktop/`: 151 frames (15 fps from the 10-second video) at 1280px, about 6.8 MB, loaded progressively
  with a coarse pass first
- `portrait/`: 45 frames (4.5 fps), a 9:16 crop that follows the door, at 540×960, about 1 MB, for
  phones held upright
- `mobile/`: 50 frames (5 fps) at 854px, about 1.2 MB, for tablets and phones held sideways
- `poster.jpg`: painted instantly. `inside.jpg`: the still shown when *Reduce motion* is on
- `public/og.jpg`: the social share image. `src/seed/images/`: gallery and story stills

`src/components/site/WalkInHero.tsx` pins a canvas and maps scroll position to frame number with GSAP
ScrollTrigger. Captions fade in on the way to the door, and the scene washes into the paper colour of
*Our Story*. On desktop, Lenis adds smooth inertia. Phones use the lighter set and native scrolling.
With `prefers-reduced-motion`, or for visitors with Data Saver on or a 2G connection, the hero is a single
still with no pinning.

**Other phone adjustments** (all in `styles.css`; desktop is unchanged):
- **Menu:** the board folds into sections, with only the first open (`MenuAccordion.tsx`).
- **Reviews:** a swipeable row.
- **Gallery:** a two-column photo wall.
- **Tap targets:** links are at least 44px tall.
- **Film grain:** lighter, and drawn without blending so scrolling stays smooth.

To replace the video (this also rebuilds the share image):

```bash
npm run frames -- "path/to/new video.mp4"
```

Then run `npm run seed` on a fresh database to refresh the gallery and story stills. On a live site,
upload new photos in the admin instead.

## 4b. The logo

The logo recreates the Handworks window decal from `../Logo.png` as vector artwork:

- "HANDWORKS" is cut out of a slanted black banner, with the O drawn as a coffee drip
- "COFFEE STUDIO" sits beneath in spaced caps, with the arrow flourish and "EST 2011"

`scripts/build-logo.mjs` sets the lettering in Big Shoulders Display, converts it to outlines, and writes:

- `public/logo.svg`: dark, for light backgrounds
- `public/logo-light.svg`: paper-coloured, for dark backgrounds
- `public/favicon.svg`: the drip-O
- `public/og.jpg`: the share image, the storefront seen through the logo
- `src/components/site/logo-data.json`: used by `<Logo>`, which draws in the current text colour

```bash
npm run logo
```

If the café has the original vector file, drop it in as `public/logo.svg` / `logo-light.svg` and replace the
paths in `logo-data.json`, or ask a developer to swap `<Logo>` for an `<img>`.

## 5. Project map

```
src/
  app/(frontend)/      public site: layout (fonts, SEO), page, styles.css, /preview routes
  app/(payload)/       Payload admin + REST API (generated; admin styling in custom.scss)
  collections/         Menu items & sections, Events, Reviews, Gallery, Media, Users
  globals/             Hours & contact, Announcement banner, Our story
  components/site/     WalkInHero, SiteNav, Sections, HoursCard, JsonLd, SmoothScroll, Reveal
  components/admin/    Dashboard welcome, logo, hours row labels
  lib/                 data loading (site.ts) and Vancouver-time hours logic (hours.ts)
  seed/                real starter content + stills from the video
  migrations/          database migrations for production
scripts/extract-frames.mjs
```

SEO: page title and description come from **Hours & contact**. Open Graph and Twitter cards use `og.jpg`,
or the *Link preview image* if one is set. Also included: `CafeOrCoffeeShop` structured data with live
opening hours, `robots.txt` (admin is blocked) and `sitemap.xml`.

## 6. Still to confirm with the owner

All of these are editable in the admin. Blank fields are simply hidden on the site.

- **Phone 604-553-8070**: listed on Yelp, Tripadvisor and MapQuest but not on Google or Facebook. Confirm it,
  or clear it.
- **Email**: not found on Google, Facebook or Instagram. Add it in Hours & contact.
- **Website**: Facebook lists handworkscoffeestudio.com, but it wasn't loading during research. If this
  new site replaces it, point that domain here.
- **Logo**: rebuilt from a photo of the window decal, so the lettering is a close match, not the original
  artwork. If the café has the original vector file, swap it in (see *The logo*).
- **Instagram/Facebook photos**: both need a login, so the gallery starts with stills from the storefront
  video. Upload favourite photos under Photos → Gallery.
- **Menu items marked "Placeholder — needs confirming"** (filter by that column in Menu → Menu items). All are
  hidden until checked:
  - Espresso Tonic, Cold Brew, Honey Yuzu Latte: seen in Google listing photos, not on the current board
  - Lemon Madeleine: an older Instagram post
  - Melon Pan, Beef Curry Pan, Mushroom Pan, Mochieese: an undated Saturday-bakes list on a third-party site
- **Pineapple Soda**: added as seasonal from the May 2026 Facebook post ("til house made syrup out"). Hide
  it if the syrup has run out.
- **Events**: a **[PLACEHOLDER]** draft for a pop-up with 咖喱家056 Japanese Spice Curry Stand (seen only as a
  tagged Instagram photo, Sep 9 2026). Confirm the details and publish, or delete it.
- **Owner names / roaster**: not found. Add them to the story if you'd like.

## Japanese touches (where to change them)

The kissaten (Shōwa-era coffee house) layer is in `src/components/site/Sections.tsx`,
`WalkInHero.tsx` and `styles.css` (search for "Japanese touches"):

- **Hero sign 手仕事 · 珈琲** ("handwork · coffee"), set vertically like a shop sign
- **Noren curtain 手仕事** hanging at the top of *Our Story*, where you step inside
- **Chapter labels:** いらっしゃいませ (welcome), お品書き (menu), 写真 (photos), お客様の声 (customer voices),
  お知らせ (news) and アクセス (access)
- **季** (*kisetsu*, season) seal on seasonal menu items, and a washi-paper texture on the menu board and review cards
- Shippori Mincho is used only for the Japanese text

## Troubleshooting

- **`/admin` or images return 404 in dev after running `npm run build`:** stop the dev server, delete the
  `.next` folder, then start `npm run dev` again. The production build and the dev server share that folder.

## Optional extras

- **Password-reset emails:** add a Payload email adapter (e.g. `@payloadcms/email-resend`) in
  `src/payload.config.ts`.
- **Typed data:** after changing fields, run `npm run generate:types`.
