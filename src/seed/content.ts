/**
 * Handworks' real starter content. Used by `npm run seed` (src/seed/index.ts) locally, and by the
 * "Load starter content" button in the live admin (src/app/(frontend)/setup/seed/route.ts).
 * WARNING: replaces existing menu, reviews, gallery, events and photos.
 *
 * Sources: Google Business listing (hours, address, rating, reviews), the in-store menu board photo,
 * Facebook page (description, May 2026 refreshers post), Yelp / Burnaby Beacon / HungryFoody (bakes),
 * Tourism Burnaby / Daily Hive / Burnaby Beacon (story), Instagram bio (tagline).
 * Anything not confirmed is left blank or hidden and listed in README → "Still to confirm".
 */
import path from 'path'
import type { Payload } from 'payload'

export async function seedContent(payload: Payload, imagesDir: string) {
  const img = (name: string) => path.resolve(imagesDir, `${name}.jpg`)

  payload.logger.info('Clearing old content…')
  for (const collection of ['menu-items', 'menu-categories', 'reviews', 'gallery', 'events', 'media'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  // ---------------------------------------------------------------- Photos (stills from the storefront video)
  payload.logger.info('Uploading photos…')
  const photo = async (name: string, alt: string) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: img(name) })).id

  const photos = {
    storefront: await photo('storefront', 'The storefront at 7705 6th Street'),
    door: await photo('red-door', 'The red door, number 7705'),
    doorway: await photo('doorway', 'Stepping through the red door'),
    counter: await photo('counter', 'The counter, menu board and pastry case'),
    inside: await photo('inside', 'Inside the studio: mugs, plaid and the espresso machine'),
  }

  // ---------------------------------------------------------------- Business info
  await payload.updateGlobal({
    slug: 'business-info',
    data: {
      name: 'Handworks Coffee Studio',
      tagline: 'Antique nano coffee studio on 6th.',
      description:
        'A tiny community café behind a red door on 6th Street in Burnaby, BC. Japanese lattes, matcha, hojicha, yuzu soda and sweets — all handcrafted in-house.',
      street: '7705 6th St',
      city: 'Burnaby',
      province: 'BC',
      postalCode: 'V3N 3M9',
      // Listed on Yelp and Tripadvisor (not on Google) — confirm with the owner.
      phone: '604-553-8070',
      email: '',
      mapQuery: 'Handworks Coffee Studio, 7705 6th St, Burnaby, BC V3N 3M9',
      seatingNote: 'A tiny room — about eight seats inside, and benches out front.',
      instagram: 'https://www.instagram.com/hwcsburnaby/',
      facebook: 'https://www.facebook.com/handworkscoffeestudio/',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Handworks+Coffee+Studio+7705+6th+St+Burnaby',
      googleRating: 4.8,
      googleReviewCount: 556,
      hours: [
        { day: 'mon', closed: true },
        { day: 'tue', closed: true },
        { day: 'wed', closed: false, open: '10:00', close: '15:00' },
        { day: 'thu', closed: false, open: '10:00', close: '15:00' },
        { day: 'fri', closed: false, open: '10:00', close: '15:00' },
        { day: 'sat', closed: false, open: '09:00', close: '15:00' },
        { day: 'sun', closed: false, open: '09:00', close: '15:00' },
      ],
      specialHours: [],
    },
  })

  // ---------------------------------------------------------------- Announcement (off by default)
  await payload.updateGlobal({
    slug: 'announcement',
    data: { enabled: false, message: 'New fall menu — come say hello!', tone: 'warm', _status: 'published' },
  })

  // ---------------------------------------------------------------- Story
  await payload.updateGlobal({
    slug: 'story',
    data: {
      _status: 'published',
      eyebrow: 'Come in',
      heading: 'A tiny room on 6th Street, made by hand.',
      paragraphs: [
        {
          text: 'Handworks began as a pop-up in 2011, pouring coffee wherever we could set up a table, and opened its first storefront in 2017. Today you’ll find us behind a red door at 7705 6th Street — an antique nano coffee studio with room for about eight.',
        },
        {
          text: 'We’re a tiny community café, run by a family with a Japanese heart. Shots are weighed, matcha is whisked to order, and the menu leans toward the drinks we love most: Japanese lattes, hojicha, a proper flat white, and our signature yuzu cane soda.',
        },
        {
          text: 'All handcrafted in-house — the syrups for our seasonal sodas, the little bakes in the case, every cup. New menus and pop-ups roll out with the seasons, so there’s usually something new to try.',
        },
        {
          text: 'Around the room you’ll find old furniture, things to read, and a shelf of zakka — the small, useful, well-made goods Japanese homes are full of. There are beans to take home, too.',
        },
        { text: 'Nothing here is rushed. Grab a coffee, take your time, and enjoy the experience with us.' },
      ],
      signoff: '— the Handworks family',
      photo: photos.counter,
      facts: [
        { label: 'Pop-up since', value: '2011' },
        { label: 'Storefront since', value: '2017' },
        { label: 'Seats', value: 'About 8' },
        { label: 'Run by', value: 'A family' },
      ],
    },
  })

  // ---------------------------------------------------------------- Menu (from the in-store board; no prices)
  payload.logger.info('Writing the menu…')
  type Item = { name: string; description?: string; hidden?: boolean; seasonal?: boolean; confirm?: boolean }
  // `confirm` items come from older or third-party sources: hidden and flagged for the owner to check.
  const menu: { name: string; note?: string; items: Item[] }[] = [
    {
      name: 'Coffee',
      items: [
        { name: 'Espresso', description: 'A short, weighed shot — the heart of everything else.' },
        { name: 'Macchiato', description: 'Espresso marked with a spoon of milk foam.' },
        { name: 'Cortado', description: 'Espresso cut with an equal part of warm milk.' },
        { name: 'Cappuccino', description: 'Espresso, steamed milk and a deep cap of foam.' },
        { name: 'Flat White', description: 'A double shot under a thin layer of silky milk.' },
        { name: 'Latte', description: 'Espresso with plenty of steamed milk.' },
        { name: 'Mocha', description: 'Espresso, chocolate and steamed milk.' },
        { name: 'Americano', description: 'Espresso lengthened with hot water.' },
        { name: 'Misto', description: 'Brewed coffee topped with steamed milk.' },
        { name: 'Japanese Latte', description: 'A house favourite — sweet on its own, the regulars say.' },
        { name: 'Decaf', description: 'Any coffee drink, made decaf on request.' },
        { name: 'Pour-over', description: 'Weekends only. Brewed by hand, one cup at a time — ask about today’s beans.' },
        // Seen in Google listing photos but not on the current board — check, then un-hide.
        { name: 'Espresso Tonic', description: 'Espresso poured over tonic and ice.', hidden: true, confirm: true },
        { name: 'Cold Brew', description: 'Slow-steeped, served cold.', hidden: true, confirm: true },
      ],
    },
    {
      name: 'Tea & Matcha',
      items: [
        { name: 'Matcha Latte', description: 'Whisked matcha with steamed milk. Lightly sweet — add sweetener if you like.' },
        { name: 'Hojicha Latte', description: 'Roasted green tea with milk: toasty and mellow.' },
        { name: 'Japanese Tea', description: 'Ask what we’re steeping today.' },
        { name: 'Organic Tea', description: 'A pot of loose-leaf tea.' },
        { name: 'London Fog', description: 'Earl Grey, vanilla and steamed milk.' },
        { name: 'Honey Yuzu Latte', description: 'Honey and yuzu with steamed milk.', hidden: true, confirm: true },
      ],
    },
    {
      name: 'Refreshers',
      note: 'Syrups made in-house',
      items: [
        { name: 'Yuzu Cane Soda', description: 'Our signature — the king of the menu. Bright Japanese citrus, fizzy and lightly sweet.' },
        {
          name: 'Pineapple Soda',
          description: 'New this season, with house-made pineapple syrup — here until the syrup runs out.',
          seasonal: true,
        },
      ],
    },
    {
      name: 'Other',
      items: [
        { name: 'Hot Chocolate', description: 'Rich and comforting.' },
        { name: 'Kids Choco', description: 'A smaller, gentler hot chocolate for little ones.' },
        { name: 'Steamed Milk' },
        { name: 'Japanese Premium Apple Juice' },
        { name: 'Orange Juice' },
      ],
    },
    {
      name: 'Sweets & Bakes',
      note: 'Baked treats change often — ask what’s in the case',
      items: [
        { name: 'Matcha & Black Sesame Moffin', description: 'Little chewy mochi muffins, in matcha and black sesame.' },
        { name: 'Croissant', description: 'Plain, flaky and buttery.' },
        { name: 'Cheese Twist Bread', description: 'Nicely salted — pairs well with a latte.' },
        // Older Instagram post (via Burnaby Beacon).
        { name: 'Lemon Madeleine', description: 'Soft, buttery and bright with lemon.', hidden: true, confirm: true },
        // Undated Saturday-bake list (via HungryFoody).
        { name: 'Melon Pan', description: 'Saturday bake — matcha, black sesame or cranberry orange.', hidden: true, confirm: true },
        { name: 'Beef Curry Pan', description: 'Saturday bake — savoury bun filled with Japanese beef curry.', hidden: true, confirm: true },
        { name: 'Mushroom Pan', description: 'Saturday bake — savoury mushroom bun.', hidden: true, confirm: true },
        { name: 'Mochieese', description: 'Saturday bake — ask us about this one.', hidden: true, confirm: true },
      ],
    },
    {
      name: 'To take home',
      items: [
        { name: 'Whole Beans', description: 'Bags of the coffee we’re pouring, by the bag.' },
        { name: 'Zakka', description: 'Small, useful, well-made goods from the shelf by the door.' },
      ],
    },
  ]

  for (const cat of menu) {
    const category = await payload.create({ collection: 'menu-categories', data: { name: cat.name, note: cat.note } })
    for (const item of cat.items) {
      await payload.create({
        collection: 'menu-items',
        data: {
          name: item.name,
          description: item.description,
          category: category.id,
          seasonal: item.seasonal ?? false,
          hidden: item.hidden ?? false,
          needsConfirming: item.confirm ?? false,
        },
      })
    }
  }

  // ---------------------------------------------------------------- Reviews (Google, copied as written; "…" marks trims)
  payload.logger.info('Adding reviews…')
  const reviews = [
    {
      author: 'Hamed S.',
      rating: 5,
      when: 'Spring 2026',
      quote:
        'What a lovely hidden gem! Such an amazing cozy and small Japanese coffee shop. Love the vibe and the perfectly selected furniture and all the little details. … The owners are such lovely people … It felt like you are someone’s guest at their home. Will for sure be a regular!',
    },
    {
      author: 'Will S.',
      rating: 5,
      when: 'Spring 2026',
      quote:
        'This place is more than just a cafe; it’s a neighborhood treasure. The coffee and Japanese-inspired treats are exceptional, reflecting the owner’s passion and skill. What makes it truly special, though, is the wonderful family who runs it.',
    },
    {
      author: 'Scott B.',
      rating: 5,
      when: 'Spring 2026',
      quote:
        'So good. The culture is great, and the coffee is up there, some of the best in Vancouver! Weekends have some food and pour overs. The beans for sale are exquisite.',
    },
    {
      author: 'Selina M.',
      rating: 5,
      when: 'Spring 2026',
      quote:
        'You can see and feel all the genuine thought behind everything they present, and the staff are super friendly and knowledgeable. They work closely with other local businesses in sourcing and developing their drinks and food …',
    },
    {
      author: 'Mayshen',
      rating: 5,
      when: 'Summer 2026',
      quote:
        'I tried the Japanese Latte today, and it was honestly one of the best lattes I’ve had in Vancouver. … The yuzu drink on the menu caught my eye too! … Great coffee, really kind staff, and such a nice atmosphere.',
    },
    {
      author: 'Cait',
      rating: 5,
      when: 'Summer 2026',
      quote:
        'A lovely Japanese cafe with a cute, cozy atmosphere. … We also tried the cheese twist bread, which was nicely salted and paired well with the drinks.',
    },
    {
      author: 'Vanessa R.',
      rating: 5,
      when: 'Summer 2026',
      quote:
        'Very cute space with lovely and attentive staff! The matcha was great … The space is very cosy and looks super comfortable.',
    },
    {
      author: 'Avinash A.',
      rating: 4,
      when: 'Summer 2026',
      quote:
        'This shop has such a cool, inviting vibe, thanks in part to the incredibly friendly staff. They serve excellent coffee, and while the indoor seating is limited to about eight, there’s always the option to relax out on the sidewalk!',
    },
    {
      author: 'Snoopy Kitchen',
      rating: 5,
      when: 'Spring 2026',
      show: false,
      quote:
        'Very friendly service and we enjoyed a plain croissant, flat white and latte. The day’s coffee bean is from Peru and medium roast just fit my taste buds.',
    },
    {
      author: 'Jon L.',
      rating: 4,
      when: 'Spring 2026',
      show: false,
      quote:
        'It’s a nice small coffee place with its own unique style. A Japanese-style café with a lot of reading material and some unique desserts.',
    },
  ]
  for (const r of reviews) {
    await payload.create({ collection: 'reviews', data: { ...r, source: 'google', show: r.show ?? true } })
  }

  // ---------------------------------------------------------------- Gallery
  payload.logger.info('Hanging the gallery…')
  const gallery = [
    { photo: photos.storefront, caption: '7705 6th Street' },
    { photo: photos.door, caption: 'Look for the red door' },
    { photo: photos.doorway, caption: 'Come on in' },
    { photo: photos.counter, caption: 'The board & the pastry case' },
    { photo: photos.inside, caption: 'Mugs, plaid and good light' },
  ]
  for (const g of gallery) await payload.create({ collection: 'gallery', data: g })

  // ---------------------------------------------------------------- Events & features
  await payload.create({
    collection: 'events',
    data: {
      _status: 'published',
      title: 'Weekend pour-overs & a little food',
      kind: 'spotlight',
      summary:
        'Saturdays and Sundays we slow down even more: hand-brewed pour-overs and a little food alongside the usual menu. Ask what beans we’re pouring.',
      image: photos.counter,
    },
  })
  await payload.create({
    collection: 'events',
    data: {
      _status: 'published',
      title: 'Yuzu cane soda & this season’s refreshers',
      kind: 'seasonal',
      summary:
        'Our signature yuzu cane soda is joined by a pineapple soda made with house-made syrup — here until the syrup runs out. All handcrafted in-house.',
      linkLabel: 'See the menu',
      linkUrl: '#menu',
    },
  })
  // Seen only as a tagged photo on Instagram (Sep 9, 2026) — details unconfirmed, so it stays a draft.
  await payload.create({
    collection: 'events',
    draft: true,
    data: {
      _status: 'draft',
      title: '[PLACEHOLDER] Pop-up with 咖喱家056 Japanese Spice Curry Stand',
      kind: 'collab',
      summary:
        'PLACEHOLDER — confirm the date, time and details with the curry stand, add a photo, then press Publish (or delete this post).',
    },
  })


  payload.logger.info('Seed complete ☕')
}

