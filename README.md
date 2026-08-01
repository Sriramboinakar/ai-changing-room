# AI Changing Room

A free MVP demo of a **virtual AI fitting room** — upload a photo, pick a garment, and see how it looks on you in seconds. Built for clothing stores and shoppers to validate the idea before spending a rupee.

**Live demo URL:** set `NEXT_PUBLIC_APP_URL` to your deployed URL (Vercel, etc.)

## Screenshots

| Landing page | AI Try-On Studio |
| ------------ | ---------------- |
| _Add a screenshot of the landing page here_ | _Add a screenshot of the studio here_ |

> **Tip:** capture your own screenshots and drop them in a `public/screenshots/` folder, then reference them as `public/screenshots/landing.png` in the table above. Placeholders above keep the layout ready.

## Features

- **AI Try-On Studio** — upload a photo (JPG/PNG/WEBP, up to 10 MB), crop/zoom/rotate to a 3:4 portrait, pick a garment, and generate
- **Demo wardrobe** — 7 built-in garments (blouse, saree, kurta, gown, blazer, shirt, anarkali) with search
- **Real AI with automatic demo fallback** — set `AI_PROVIDER=fal` for real CatVTON generations; if the AI is down or unconfigured, the app falls back to mock and shows a friendly "Demo Mode" notice
- **Before/After comparison** — draggable slider + side-by-side views, keyboard accessible
- **Download & share** — every result exports as a PNG
- **Privacy by design** — no accounts, no uploads to servers, session persists locally in `localStorage`
- **Provider-based AI** — ships with a fast mock provider; real models drop in via one factory
- **Polish** — dark/light mode, mobile-first responsive UI, 404/error/loading states, SEO (sitemap, robots, manifest, OG image), accessible (skip link, ARIA, keyboard navigation, reduced motion)

## Tech Stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 15 (App Router, Turbopack)        |
| Language  | TypeScript                                |
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
| `AI_PROVIDER`            | No       | `mock`              | `mock` (default), `fal`, or `huggingface`          |
| `FAL_KEY`                | No       | —                   | Required when `AI_PROVIDER=fal`. Get one at [fal.ai](https://fal.ai/dashboard/keys) |
| `HUGGINGFACE_TOKEN`      | No       | —                   | Required when `AI_PROVIDER=huggingface`            |
| `AI_PROVIDER_MOCK_MIN_DELAY_MS` | No | `3000`           | Min mock generation delay                          |
| `AI_PROVIDER_MOCK_MAX_DELAY_MS` | No | `5000`           | Max mock generation delay                          |
| `NEXT_PUBLIC_APP_URL`    | No       | `http://localhost:3000` | Canonical URL for SEO/OG metadata              |

## Project Structure

```
src/
├── app/
│   ├── api/tryon/          # POST /api/tryon — Zod-validated generation endpoint
│   ├── try-on/             # AI Try-On Studio page
│   ├── layout.tsx          # Fonts, metadata, skip link, providers
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # Custom 404
│   ├── loading.tsx         # Skeleton loaders
│   ├── sitemap.ts / robots.ts / manifest.ts / opengraph-image.tsx
├── components/
│   ├── landing/            # Navbar, hero, how-it-works, features, demo, reviews, FAQ, CTA, footer
│   ├── tryon/              # Studio orchestrator, upload, crop, garment picker, overlay, result
│   ├── shared/             # Before/after slider, reveal, section heading, logo
│   └── ui/                 # shadcn/ui primitives
├── lib/
│   ├── ai/                 # TryOnProvider interface, factory, mock + fal + huggingface providers
│   ├── image/              # Validation, compression, crop, PNG export
│   └── tryon/              # Garment catalog + session persistence
└── config/site.ts          # Site-wide config
```

## Architecture

The app is a classic three-layer flow, with the AI deliberately isolated behind an interface so the UI never cares which model is running.

```
Browser (try-on studio)              Next.js server                   AI backend
─────────────────────────            ─────────────────────            ───────────
Upload photo ──► crop 3:4 ──►        POST /api/tryon
Pick garment  ─────────────────►     (Zod validation)
                                     ┌─ getTryOnProvider() ─────────► mock (3–5s simulated)
                                     │                          ┌────► fal.ai CatVTON
                                     └─ provider.generate() ───┘     (queue → poll → result)
                                     │
                                     └─ fallback to mock + "Demo Mode" notice on failure
                                     │
◄── result image (data URL) ◄────────┘
```

Key design decisions:

- **Provider interface** (`src/lib/ai/types.ts`) — every backend implements `TryOnProvider.generate()`; the factory (`src/lib/ai/index.ts`) picks the implementation from `AI_PROVIDER` and silently falls back to mock when a key is missing
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

## Design Docs

`PRD.md`, `TASKS.md`, `DATABASE.md`, `API.md`, and `UI_GUIDE.md` are the source-of-truth specifications for this project.

## Roadmap

- [x] Real AI integration (fal.ai CatVTON provider with automatic mock fallback)
- [ ] Commercially-licensed AI provider (CatVTON/IDM-VTON are non-commercial licensed)
- [ ] Supabase auth, store dashboard, and garment inventory
- [ ] QR-code fitting sessions for physical stores
- [ ] Payments (Razorpay) and subscription plans
- [ ] Gallery + shareable result links
- [ ] Analytics for stores
