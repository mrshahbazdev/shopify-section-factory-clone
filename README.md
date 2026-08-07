# Shopify Section Factory Clone

A Shopify embedded app clone of [Section Store / Section Factory](https://apps.shopify.com/section-factory): browse, purchase and install 700+ theme sections, build bundles, and unlock conversion blocks, cart drawer and quantity-break upgrades.

## Stack

- Remix with Vite
- Shopify App Bridge + Polaris
- Prisma + MySQL
- `@shopify/shopify-app-remix`

## Features

- **Explore Sections** — category tabs, search, sorting and a card grid of 769 section designs
- **Section Detail** — one-time billing (via `appPurchaseOneTimeCreate`) and one-click install into the active theme as a `sections/{handle}.liquid` asset
- **Bundle & Save** — custom bundle builder with discount tiers
- **Conversion Blocks** — product-page conversion blocks (Plus)
- **Bundles / Quantity Breaks** — volume discounts and bundle offers (Plus)
- **Cart Drawer** — global cart drawer with upsells and rewards (Plus)
- **Help & Resources** — FAQ page
- **Settings** — Plus toggle and support email

## Data

Section and category data was extracted from the Section Store demo store and stored in `app/data/sections.json` and `app/data/categories.json`.

Section Liquid is loaded at runtime from `app/sections/{handle}.liquid`. `726` of those files were scraped from the real Section Store demo pages; the remaining sections fall back to the generated starter templates. Run `npm run generate:liquid` to regenerate fallback templates.

## Getting started (local)

1. Install dependencies:
   ```bash
   npm install --force
   ```
2. Copy `.env.example` to `.env` and set your Shopify Partner app credentials and database details:
   ```bash
   cp .env.example .env
   ```

   Use either `DATABASE_URL` (full MySQL connection string) or separate `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` variables. `server.js` builds `DATABASE_URL` automatically when the separate variables are provided.
3. Create a MySQL database (e.g., `section_factory`) and apply migrations:
   ```bash
   npm run setup
   ```
4. Link your Shopify app:
   ```bash
   npx shopify app config link
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Production / VPS deploy

1. Build the app:
   ```bash
   npm install --force
   npm run setup   # applies Prisma migrations to your MySQL database
   npm run build
   ```
2. Configure `shopify.app.toml` with your production `application_url` and `redirect_urls`.
3. Deploy the app and theme app extension:
   ```bash
   npx shopify app deploy --allow-updates
   ```
4. Start the production server:
   ```bash
   npm run start
   ```

The app runs on `PORT` (default `3000`).

### Reverse proxy options

- **Nginx** — proxy `https://sections.clipvaultz.online` to `http://127.0.0.1:3000`.
- **Apache** — upload the included `.htaccess` file and make sure `mod_rewrite` + `mod_proxy` are enabled. It forwards all traffic to `http://127.0.0.1:3000`.
- **Caddy** — `reverse_proxy localhost:3000`.

Make sure the Node process (`node server.js` / `npm start` / PM2) is running in the background.

## Theme App Extension (Plus features)

The `extensions/section-factory-plus` theme app extension exposes three blocks:

- `blocks/conversion-blocks.liquid`
- `blocks/bundle.liquid`
- `blocks/cart-drawer.liquid`

Configuration is written to shop metafields by the admin routes in `app/routes/app.conversion-blocks.tsx`, `app.bundles.tsx` and `app.cart-drawer.tsx`. The extension is bundled and deployed with `npx shopify app deploy --allow-updates`.

## Scripts

- `npm run build` — build the Remix app for production
- `npm run start` — run the production server
- `npm run lint` — run ESLint
- `npm run setup` — generate Prisma client and apply MySQL migrations
- `npm run generate:liquid` — regenerate `app/sections/*.liquid` fallback templates

## Notes

This is a functional MVP clone of the Section Store admin experience. Real Section Store-quality markup for the 726 scraped sections lives in `app/sections/*.liquid`. The remaining sections use generated starter templates that can be replaced with bespoke designs over time.
