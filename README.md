# Red Betta

**Flow your way.** The official online store for Red Betta, premium Indian streetwear from the House of RetailJinny.

A complete, production-ready e-commerce site: storefront, cart, checkout with Razorpay (UPI, cards, net banking, wallets) and cash on delivery, customer accounts, and a full admin dashboard for products, stock, orders, coupons and storefront images.

## Features

**Storefront**
- Premium dark design built around the Red Betta identity, responsive from 320 px phones to large desktops
- Shop with category, size and price filters, sorting, search and pagination
- Product pages with swipeable gallery, size picker that knows stock per size, size guide, reviews from verified buyers, related products and structured data for Google
- Slide-out bag with free-shipping progress, saved across visits and synced between tabs
- Checkout with saved addresses, coupon codes, Razorpay and COD, live price and stock re-validation
- Order confirmation and tracking page, email confirmations and shipping updates
- Customer accounts: order history, wishlist, address book, profile and password, sign out everywhere
- About, contact, FAQ, shipping and returns, size guide, privacy and terms pages
- SEO: metadata, Open Graph image, sitemap, robots, JSON-LD

**Admin** (`/admin`)
- Dashboard: revenue, orders, average order value, customers, 14-day revenue chart, low-stock alerts
- Orders: filter, search, update status, add courier and tracking (emails the customer), cancel (returns stock), mark COD as paid, refunds
- Products: create and edit with image upload, sizes, colours, SKUs and stock per variant, featured and active toggles
- Categories, coupons (percent or fixed, minimum order, cap, usage limit, expiry), customers, contact messages, newsletter export (CSV)
- Storefront images: replace the hero, category and story photos without touching code

**Security**
- Passwords hashed with bcrypt, signed HTTP-only session cookies, sessions revoked on password change
- Every admin page, action and API checks the admin role on the server
- Prices, discounts and stock are always recalculated on the server; the browser is never trusted
- Razorpay payment and webhook signatures verified with constant-time comparison
- Stock is reserved atomically so two shoppers can never buy the last piece twice; unpaid orders release stock automatically
- Rate limiting on sign-in, sign-up, checkout, coupons and forms
- Strict security headers (CSP, HSTS, frame blocking, no sniffing), CSRF protection on all mutations
- Upload validation by file signature, input validation with Zod everywhere

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL · Prisma 7 · Razorpay · Resend (email) · Vercel Blob (uploads) · Vitest

## Run it locally

**Quickest way (Windows or Mac):** install [Node.js LTS](https://nodejs.org), [Git](https://git-scm.com) and [Docker Desktop](https://www.docker.com/products/docker-desktop), open Docker Desktop, then run:

```bash
git clone -b claude/stoic-edison-ol6n6g https://github.com/officialsayanbakshi2003-ai/Red-Bette.git
cd Red-Bette
npm install
npm run local
```

`npm run local` creates `.env` with a random secret, starts the database, loads the catalogue and starts the store. Admin login: `admin@redbetta.in` / `RedBetta@2026` (change `ADMIN_PASSWORD` in `.env` before going live).

**Manual setup:**

Requirements: Node.js 20.9 or newer, and PostgreSQL 14 or newer (or Docker).

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (skip if you already have one)
docker compose up -d db

# 3. Configure environment
cp .env.example .env
#    then set AUTH_SECRET (openssl rand -base64 48) and ADMIN_PASSWORD

# 4. Create the tables and load the catalogue, coupons and admin account
npm run db:migrate
npm run db:seed

# 5. Start the store
npm run dev
```

Open http://localhost:3000 for the store and http://localhost:3000/admin for the dashboard (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

Without Razorpay keys, local checkout uses a **demo payment** screen so you can test the full flow. Demo payments are always disabled in production.

### Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests |
| `npm run db:migrate` | Create/apply database migrations (development) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Load catalogue, coupons and admin account (safe to re-run) |
| `npm run db:studio` | Browse the database |

## Go live

### 1. Database
Create a PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com) or any host, and copy its connection string into `DATABASE_URL`.

### 2. Razorpay
1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC.
2. **Settings → API Keys**: generate keys, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (use `rzp_test_` keys first).
3. **Settings → Webhooks**: add `https://YOUR-DOMAIN/api/webhooks/razorpay` with the events `payment.captured`, `order.paid`, `payment.failed` and `refund.processed`. Put the webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
4. Test a full order with Razorpay test cards or UPI, then switch to live keys.

### 3. Deploy on Vercel (recommended)
1. Import this repository at [vercel.com/new](https://vercel.com/new).
2. Add every variable from `.env.example` in **Settings → Environment Variables** (set `ALLOW_DEMO_PAYMENTS` to `false`).
3. **Storage → Blob**: create a store so admin uploads work; `BLOB_READ_WRITE_TOKEN` is added for you.
4. Set the build command to `npm run db:deploy && npm run build` so migrations run on each deploy.
5. Deploy, then seed once from your machine: `DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed`.
6. Add your domain and set `NEXT_PUBLIC_SITE_URL` to it.

`vercel.json` schedules a daily clean-up of unpaid orders (the Hobby plan allows one run per day; each checkout also cleans up). Set `CRON_SECRET` to enable it.

### Or deploy with Docker (VPS, Railway, Render)
```bash
docker compose --profile app up -d --build
docker compose exec web npx prisma migrate deploy
docker compose exec web npx prisma db seed
```
Uploads are stored in the `uploads` volume. Put the app behind HTTPS (Caddy, Nginx or your platform's proxy).

### 4. Email (optional but recommended)
Create a [Resend](https://resend.com) account, verify your domain, and set `RESEND_API_KEY` and `EMAIL_FROM`. Without it, emails are only logged.

## Make it yours

- **Store settings** (shipping fee, free-shipping threshold, COD fee and limit, return window, contact details): `src/lib/config.ts`
- **Products, stock, coupons, storefront photos**: from the admin dashboard
- **Brand colours and fonts**: `src/app/globals.css`
- **Product photos**: products without a photo show a "Photo coming soon" placeholder. Upload photos from **Admin → Products** (portrait 4:5, around 1600 × 2000 px).
- **Lifestyle photos**: defaults are the Red Betta campaign images in `public/images` (one category tile uses a free [Pexels](https://www.pexels.com/license/) photo). Replace any of them in **Admin → Storefront**. Prompts for generating on-brand images are in [`docs/IMAGE_PROMPTS.md`](docs/IMAGE_PROMPTS.md).

## Project structure

```
prisma/              Database schema, migrations and seed data
public/images/       Campaign photos and placeholder
public/brand/        Logo marks
src/app/(store)/     Storefront pages
src/app/admin/       Admin dashboard
src/app/api/         Checkout, payments, webhooks, uploads, cron
src/actions/         Server actions (forms)
src/components/      UI components
src/lib/             Business logic: pricing, orders, auth, payments, validation
tests/               Unit tests
```

## Keep the repository private

This repository contains your store's code. In GitHub go to **Settings → General → Danger Zone → Change repository visibility → Make private**. Never commit your `.env` file (it is already ignored).

© Red Betta. From the House of RetailJinny.
