# Refine — Full-Stack E-Commerce Platform

A production-grade e-commerce platform built with Next.js 16 App Router. Live at [refine.pk](https://refine.pk).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Cache Components) |
| Language | TypeScript 5, React 19 |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Neon Auth (better-auth) |
| Storage | Cloudflare R2 |
| Email | Resend + React Email |
| UI | Base UI, shadcn/ui, Tailwind CSS 4 |
| Testing | Vitest + Playwright |

## Features

### Storefront
- Product catalog with categories, search, and filtering
- Flash sales and promotional banners
- Shopping cart and checkout flow
- Customer accounts and order history
- Reviews, loyalty points, and referral program
- Transactional email (order confirmations)

### Admin Panel
- Product and inventory management (variants, images, warehouse locations)
- Order management and fulfillment
- Customer, coupon, and flash sale management
- Delivery zone configuration
- Returns, support tickets, and review moderation
- Activity logs, analytics, and SEO management
- Admin user roles and permissions

## Getting Started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) database
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket
- A [Resend](https://resend.com) API key

### Setup

```bash
git clone https://github.com/faisal212/neon-next-ecommerce.git
cd neon-next-ecommerce
npm install
cp .env.example .env.local   # fill in your credentials
npm run db:migrate
npm run db:seed
npm run db:seed-admin        # requires SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEON_AUTH_BASE_URL` | Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | Cookie signing secret |
| `R2_ENDPOINT` | Cloudflare R2 endpoint URL |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public CDN URL for assets |
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM` | Sender address |
| `NEXT_PUBLIC_SITE_URL` | Production URL (used for OG images) |
| `REVALIDATION_SECRET` | Secret for cache revalidation webhook |

## Scripts

```bash
npm run dev              # development server
npm run build            # production build
npm run db:migrate       # run database migrations
npm run db:studio        # open Drizzle Studio
npm run db:seed          # seed product/category data
npm run db:seed-admin    # create admin user
npm run test:run         # run all unit + integration tests
npm run test:e2e         # run Playwright E2E tests
```

## Project Structure

```
app/
  (store)/     # customer-facing storefront
  (admin)/     # admin dashboard
  api/         # API routes
components/
  store/       # storefront UI components
  admin/       # admin UI components
lib/
  db/          # Drizzle schema and queries
  auth/        # authentication helpers
  services/    # business logic
  validators/  # Zod schemas
e2e/           # Playwright specs
__tests__/     # Vitest unit + integration tests
```

## License

MIT
