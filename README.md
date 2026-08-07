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

Section and category data was extracted from the Section Store demo store and stored in `app/data/sections.json` and `app/data/categories.json`. Each section now has a generated Shopify Liquid template (`liquid` field) for one-click theme installation. Run `npm run generate:liquid` to regenerate these templates.

## Getting started

1. Copy `.env.example` to `.env` and fill in your Shopify Partner app credentials.
2. Install dependencies:
   ```bash
   npm install --force
   npm run setup
   ```
3. Link your Shopify app config:
   ```bash
   npm run config:link
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run build` — build the Remix app for production
- `npm run start` — run the production server
- `npm run lint` — run ESLint
- `npm run setup` — generate Prisma client and run migrations

## Notes

This is a functional MVP clone of the Section Store admin experience. Theme-side Liquid assets, one-time billing, purchase/install records and the Plus upgrade features are scaffolded and wired to the Shopify Admin API. The generated Liquid for each section is a starter template — replace with full section markup per design.
