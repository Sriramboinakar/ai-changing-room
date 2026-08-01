# AI Changing Room

A free MVP demo of a **virtual AI fitting room** — upload a photo, pick a garment, and see how it looks on you in seconds. Built for clothing stores and shoppers to validate the idea before spending a rupee.

**Live demo URL:** set `NEXT_PUBLIC_APP_URL` to your deployed URL (Vercel, etc.)

## Screenshots

| Landing page | AI Try-On Studio |
| ------------ | ---------------- |
| _Add a screenshot of the landing page here_ | _Add a screenshot of the studio here_ |

> **Tip:** capture your own screenshots and drop them in a `public/screenshots/` folder, then reference them as `public/screenshots/landing.png` in the table above. Placeholders above keep the layout ready.

## Features

- **AI Try-On Studio** — customers upload a photo (JPG/PNG/WEBP, up to 10 MB), crop/zoom/rotate to a 3:4 portrait, browse the store catalog, and generate. Switching garments is instant — no re-uploading
- **Store catalog** — shop owners upload garments once at `/owner`; every garment is stored in SQLite with category (Saree, Kurti, Kurta, Gown, Shirt, Blouse, Anarkali, Blazer, Dress, Lehenga, Skirt, Pants), editable and deletable
- **Seeded demo store** — `npm run db:seed` creates a "Demo Boutique" with 7 built-in garments (blouse, saree, kurta, gown, blazer, shirt, anarkali)
- **Real AI with automatic demo fallback** — set `AI_PROVIDER=idmvton` for **free real AI** (public IDM-VTON Space on Hugging Face ZeroGPU, no key required) or `AI_PROVIDER=fal` for the hosted CatVTON model on fal.ai; if the AI is down or unconfigured, the app falls back to mock and shows a friendly "Demo Mode" notice
- **Before/After comparison** — draggable slider + side-by-side views, keyboard accessible
- **Download & share** — every result exports as a PNG
- **Privacy by design** — no accounts, session persists locally in `localStorage`; only catalog images live on the server
- **Provider-based AI** — ships with a fast mock provider; real models drop in via one factory
- **Polish** — dark/light mode, mobile-first responsive UI, 404/error/loading states, SEO (sitemap, robots, manifest, OG image), accessible (skip link, ARIA, keyboard navigation, reduced motion)

## Tech Stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 15 (App Router, Turbopack)        |
| Language  | TypeScript                                |
| Database  | SQLite via Prisma 7 (driver adapters)     |
| Styling   | Tailwind CSS v4 + shadcn/ui (radix-nova)  |
| Motion    | Framer Motion                             |
| Forms     | Zod (API validation)                      |
| State     | React state + localStorage persistence    |
| AI        | Provider abstraction (`src/lib/ai/`)      |
| Deploy    | Vercel (recommended)                      |

## Getting Started

```bash
npm install
cp .env.example .env.local   # then edit as needed
npm run db:push              # create the SQLite database (prisma/dev.db)
npm run db:seed              # create the demo store + 7 garments
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Environment Variables

| Variable                 | Required | Default             | Description                                        |
| ------------------------ | -------- | ------------------- | -------------------------------------------------- |
| `DATABASE_URL`           | No       | `file:./prisma/dev.db` | SQLite database file (created by `db:push`)      |
| `AI_PROVIDER`            | No       | `mock`              | `mock` (default), `idmvton`, `fal`, or `huggingface` |
| `IDMVTON_SPACE_URL`      | No       | `https://yisol-idm-vton.hf.space` | Free IDM-VTON Space (ZeroGPU, no key) when `AI_PROVIDER=idmvton` |
| `FAL_KEY`                | No       | —                   | Required when `AI_PROVIDER=fal`. Get one at [fal.ai](https://fal.ai/dashboard/keys) |
| `HUGGINGFACE_TOKEN`      | No       | —                   | Required when `AI_PROVIDER=huggingface`; optional but recommended for `idmvton` (free token = much larger ZeroGPU quota) |
| `AI_PROVIDER_MOCK_MIN_DELAY_MS` | No | `3000`           | Min mock generation delay                          |
| `AI_PROVIDER_MOCK_MAX_DELAY_MS` | No | `5000`           | Max mock generation delay                          |
| `NEXT_PUBLIC_APP_URL`    | No       | `http://localhost:3000` | Canonical URL for SEO/OG metadata              |

## Project Structure

```
src/
├── app/
│   ├── api/stores/            # POST/GET stores; catalog CRUD per store
│   ├── api/tryon/             # POST /api/tryon — Zod-validated generation endpoint
│   ├── owner/                 # Store owner catalog manager
│   ├── try-on/                # AI Try-On Studio page
│   ├── layout.tsx             # Fonts, metadata, skip link, providers
│   ├── error.tsx              # Error boundary
│   ├── not-found.tsx          # Custom 404
│   ├── loading.tsx            # Skeleton loaders
│   ├── sitemap.ts / robots.ts / manifest.ts / opengraph-image.tsx
├── components/
│   ├── landing/               # Navbar, hero, how-it-works, features, demo, reviews, FAQ, CTA, footer
│   ├── tryon/                 # Studio orchestrator, upload, crop, garment picker, overlay, result
│   ├── shared/                # Before/after slider, reveal, section heading, logo
│   └── ui/                    # shadcn/ui primitives
├── generated/prisma/          # Prisma client (generated — do not edit)
├── lib/
│   ├── ai/                    # TryOnProvider interface, factory, mock + idmvton + fal + huggingface providers
│   ├── db.ts                  # Prisma client singleton (better-sqlite3 adapter)
│   ├── image/                 # Validation, compression, crop, PNG export
│   └── tryon/                 # Categories, garment types, session persistence
└── config/site.ts             # Site-wide config
prisma/
├── schema.prisma              # Store + CatalogItem models
└── seed.ts                    # Demo store + 7 garments
public/uploads/                # Catalog images, one folder per store (gitignored)
```

## Architecture

The app is a classic three-layer flow, with the AI deliberately isolated behind an interface so the UI never cares which model is running.

```
Store owner                              Next.js server                      Customer
────────────                             ─────────────────────               ─────────
Upload garment ──► /owner ──────────────► POST /api/stores/[slug]/catalog
                                          (file → public/uploads, row in SQLite)
                                                                             Browse catalog ◄── GET (category filter)
                                                                             Upload photo ──► POST /api/tryon
Pick garment   ─────────────────────────►                                   (Zod validation)
                                          ┌─ getTryOnProvider() ─────────► mock (3–5s simulated)
                                          │                          ┌────► idmvton (free IDM-VTON Space)
                                          └─ provider.generate() ───┤
                                                                  └────► fal.ai CatVTON
                                                                        (queue → poll → result)
                                         │
                                         └─ fallback to mock + "Demo Mode" notice on failure
                                         │
◄── result image (data URL) ◄─────────────┘
```

Key design decisions:

- **Provider interface** (`src/lib/ai/types.ts`) — every backend implements `TryOnProvider.generate()`; the factory (`src/lib/ai/index.ts`) picks the implementation from `AI_PROVIDER` and silently falls back to mock when a key is missing
- **Catalog in the database** — stores and their garments live in SQLite (Prisma 7 with the better-sqlite3 driver adapter); images are written to `public/uploads/{storeId}/` so they can be served as static assets
- **Self-contained results** — providers return data URLs, so results survive localStorage session persistence and download via canvas without CORS issues
- **Frontend-agnostic** — the studio, crop pipeline, and result views never reference a specific provider

## Scripts

| Script            | Purpose                       |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start dev server (Turbopack)  |
| `npm run build`   | Production build (Turbopack)  |
| `npm run start`   | Serve production build        |
| `npm run lint`    | ESLint                        |
| `npx tsc --noEmit`| Type check                    |
| `npm run db:push` | Sync SQLite schema (Prisma 7) |
| `npm run db:seed` | Seed demo store + garments    |

## Design Docs

`PRD.md`, `TASKS.md`, `DATABASE.md`, `API.md`, and `UI_GUIDE.md` are the source-of-truth specifications for this project.

## Roadmap

- [x] Real AI integration (fal.ai CatVTON provider with automatic mock fallback)
- [x] Free AI for business demos (IDM-VTON Space via ZeroGPU, no key required)
- [x] Store catalog + owner dashboard (SQLite, garment upload/edit/delete)
- [ ] Auth for multiple stores (currently a single demo store)
- [ ] Commercially-licensed AI provider (CatVTON/IDM-VTON are non-commercial licensed)
- [ ] QR-code fitting sessions for physical stores
- [ ] Payments (Razorpay) and subscription plans
- [ ] Gallery + shareable result links
- [ ] Analytics for stores
