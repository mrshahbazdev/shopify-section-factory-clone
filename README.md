# Shopify Section Factory Clone

A Shopify embedded app clone of [Section Store / Section Factory](https://apps.shopify.com/section-factory): browse, purchase and install 700+ theme sections, build bundles, and unlock conversion blocks, cart drawer and quantity-break upgrades.

## Stack

- Remix with Vite
- Shopify App Bridge + Polaris
- Prisma + SQLite (easy local dev; swap to MySQL/Postgres for production)
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

## Getting started

1. Install dependencies and set up the database:
   ```bash
   npm install --force
   npm run setup
   ```
2. Copy `.env.example` to `.env` and fill in your Shopify Partner app credentials, or pull them from the linked app:
   ```bash
   npx shopify app env pull
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Deploy

1. Link the app to a Partner Dashboard app:
   ```bash
   npx shopify app config link
   # or link by an existing client ID:
   npx shopify app config link --client-id <YOUR_CLIENT_ID>
   ```
2. Deploy the app and its theme app extension:
   ```bash
   npx shopify app deploy --allow-updates
   ```
3. For live testing, set `SHOPIFY_APP_URL` and `redirect_urls` in `shopify.app.toml` to a public HTTPS URL reachable by Shopify, then re-deploy.

## Install on a development store

The fastest way to test billing and the admin UI is to run:

```bash
npx shopify app dev --store <your-dev-store>.myshopify.com
```

`shopify app dev` will create a Cloudflare tunnel, update the app URL for the dev session, and open the install URL. If the store has a storefront password, enter it when prompted. Once installed, the app appears under **Apps** in the store admin, and the section detail page can create real `appPurchaseOneTimeCreate` charges.

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
- `npm run setup` — generate Prisma client and run migrations
- `npm run generate:liquid` — regenerate `app/sections/*.liquid` fallback templates

## Notes

This is a functional MVP clone of the Section Store admin experience. Real Section Store-quality markup for the 726 scraped sections lives in `app/sections/*.liquid`. The remaining sections use generated starter templates that can be replaced with bespoke designs over time.
