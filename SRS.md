# AI Changing Room — Software Requirements Specification (SRS)

| Field          | Value                    |
| -------------- | ------------------------ |
| Version        | 1.0                      |
| Status         | Draft — for team review  |
| Author         | Product / Engineering    |
| Applies to     | AI Changing Room         |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for the **AI Changing Room** platform — a web application that lets shoppers virtually try on garments (sarees, lehengas, kurtas, etc.) before buying, and lets clothing stores offer this experience in-store and online.

It is intended for the engineering, design, and product teams as the single source of truth for *what* the product must do and *how well* it must perform. Where a requirement is not yet implemented, it is explicitly marked **Planned**.

### 1.2 Scope

- **In scope:** public marketing site, AI virtual try-on studio, store catalog (read APIs), configuration of AI providers, theming and accessibility.
- **Out of scope (Planned):** authentication, store-owner inventory management, QR sessions, customer gallery, analytics, subscriptions/payments, admin panel, native mobile apps.

### 1.3 Definition of Done (project rules)

- Zero TypeScript and ESLint errors on ship.
- Every screen has loading and error states.
- No hard-coded secrets; all keys via environment variables.
- Responsive on mobile, tablet, and desktop.
- All AI providers interchangeable behind a single interface without changing application code.

---

## 2. Product Vision

Build a production-quality SaaS platform that lets clothing stores and fashion brands give customers a realistic virtual fitting-room experience, reducing returns and purchase hesitation.

### Problem statement

- Customers spend a lot of time and effort trying outfits.
- Staff spend significant time assisting with physical change rooms.
- Expensive garments can get damaged from repeated trials.
- Online shoppers cannot visualize fit before purchase.

### Solution

- Customer uploads a standing photo (or uses the demo).
- Customer selects a garment (saree, lehenga, kurta, blouse, etc.).
- AI generates a realistic wear-preview image.
- Customer compares, downloads, and shares results.

---

## 3. Users & Roles

| Role           | Description                                              | Current access (MVP)        |
| -------------- | -------------------------------------------------------- | --------------------------- |
| **Guest customer** | Exercises the public try-on demo. No login required.  | Try-on studio (live)        |
| Store owner     | Manages store catalog and settings (future).             | Owner page (mock)           |
| Sales staff     | Scans products, generates QR sessions (future).          | Planned                     |
| Admin           | Oversees stores, users, revenue (future).                | Planned                     |

---

## 4. Operating Environment

| Layer          | Technology (current)                                       | Notes                                       |
| -------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Framework      | Next.js 15 (App Router) + React 19                         | Server Components + Route Handlers          |
| Language       | TypeScript (strict)                                        |                                              |
| UI             | Tailwind CSS v4, shadcn/ui, framer-motion                  | Theme: Royal Heritage (maroon + gold)       |
| Database (ORM)| Prisma 7 (driver adapters)                                 | PostgreSQL (Neon serverless)                 |
| Run/time platform| Vercel (serverless)                                     | Hobby plan today; native modules tuned       |
| AI inference   | Plug-and-play providers, single interface                  | mock (default), fal.ai, IDM-VTON, HuggingFace |
| Secrets        | Environment variables (.env.local + Vercel env vars)       | Never committed                             |

### 4.1 AI provider interface

Providers are selected via `AI_PROVIDER`: `mock | fal | idmvton | huggingface`.

- **mock** — deterministic demo images, no keys required, modest latency (3–5 s simulated). Default.
- **fal** — hosted CatVTON model on fal.ai, requires `FAL_KEY`.
- **idmvton** — free public IDM-VTON Space on Hugging Face (ZeroGPU), optionally boosted with `HUGGINGFACE_TOKEN`.
- Providers failing (timeouts, 503s, network) auto-fall back to `mock` with a user notice so the demo never breaks.

---

## 5. Functional Requirements

### FR-01 Marketing / Landing site

| ID     | Requirement                                                        | Status     |
| ------ | ------------------------------------------------------------------ | ---------- |
| FR-01.1 | Hero section explaining value proposition and a primary CTA to the studio. | Implemented |
| FR-01.2 | "How it works" interactive 3-step explainer (upload → pick → generate). | Implemented |
| FR-01.3 | Feature grid, live before/after demo, testimonials, FAQ, stats band. | Implemented |
| FR-01.4 | Persistent top navigation with mobile menu (sheet) and theme toggle. | Implemented |
| FR-01.5 | Footer with product/company/resource links and socials. | Implemented |
| FR-01.6 | Brand design system: "Royal Heritage" palette (madder maroon `#7A1226`, royal gold `#C79A2E`, warm ivory `#FBF6EC`), Playfair Display headings, Jali latticed motifs. | Implemented |
| FR-01.7 | Motion: scroll reveals, hover lift, garment marquee, gold shimmer, floating orbs, CTA sheen — all honouring `prefers-reduced-motion`. | Implemented |

### FR-02 AI Virtual Try-On Studio

| **ID**     | Requirement                                        | Status       |
| ---------- | ---------------------------------------------------------------- | ------------ |
| FR-02.1 | Upload a customer photo from device (image, crop dialog, client-side). | Implemented |
| FR-02.2 | Browse demo store catalog by category with search. | Implemented |
| FR-02.3 | Select a garment and trigger AI generation. | Implemented |
| FR-02.4 | POST /api/tryon validates inputs (Zod), requests AI, returns image URL/ provider/ duration/latency sync. | Implemented |
| FR-02.5 | Graceful degradation: provider missing key → mock + notice; provider 503 → mock + notice. | Implemented |
| FR-02.6 | Server-side timeout (Vercel Hobby = 60 s; real inference may take longer — see issue link in §9). | Implemented |
| FR-02.7 | Result view: preview rendered image, download / share actions. | Implemented |
| FR-02.8 | Client uploads stay on device; images referenced by URL or public path. | Implemented |

### FR-03 Store & catalogue (read-only MVP)

| **ID**     | Requirement                                        | Status       |
| ---------- | -------------------------------------------------- | ------------ |
| FR-03.1 | GET /api/stores — list stores/show public. | Implemented |
| FR-03.2 | GET /api/stores/[slug]/catalog — items for a store, optional `category` filter, sorted. | Implemented |
| FR-03.3 | GET /api/stores/[slug]/catalog/[id] — single item. | Implemented |
| FR-03.4 | PATCH /api/stores/[slug]/catalog/[id] — rename/re-categorise. | Implemented |
| FR-03.5 | DELETE /api/stores/[slug]/catalog/[id] — remove item. | Implemented |
| FR-03.6 | Persistence via Prisma on Neon Postgres. | Implemented |
| FR-03.7 | POST catalog uploads (create item w/ image upload). | **Planned** (storage not wired) |

### FR-04 API contract

| ID | Requirement | Status |
| --- | ----------- | ------ |
| FR-04.1 | Uniform successful envelope: `{ success: true, data }`. | Implemented |
| FR-04.2 | Uniform error envelope: `{ success: false, message, error }` with correct HTTP status. | Implemented |
| FR-04.3 | Request validation on every endpoint (Zod). | Implemented |
| FR-04.4 | API endpoints rate-limited for AI (no hammering). | **Planned** |

### FR-05 Future roadmap (out of current MVP scope)

| ID | Requirement | Status |
| -- | ----------- | ------ |
| FR-05.1 | Accounts: Clerk auth (customer, owner, staff, admin). | Planned |
| FR-05.2 | Store-owner inventory management (CRUD products, SKU/barcode, images, sizes, prices). | Planned |
| FR-05.3 | QR-code sessions: staff scans product → customer opens try-on page for that product. | Planned |
| FR-05.4 | Customer gallery: save / favourite / download / share / compare results. | Planned |
| FR-05.5 | Analytics dashboard: try-ons, popular items, downloads, conversions, revenue. | Planned |
| FR-05.6 | Subscriptions & payments (Razorpay); per-store AI generation allowances. | Planned |
| FR-05.7 | Admin panel: stores, users, AI usage, revenue. | Planned |
| FR-05.8 | Live-camera try-on, multi-garment comparison, WhatsApp sharing, multi-language. | Future |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
| -- | ----------- | ------ |
| NFR-01 | Performance | LCP < 2.5 s on 4G; static landing pre-rendered; studio interactive responsive. |
| NFR-02 | Reliability | AI failures auto-fallback to demo; never show a dead state. |
| NFR-03 | Security | No secrets in repository; endpoints validate input; rate-limit AI; CORS policy defined; never expose AI keys client-side. |
| NFR-04 | Privacy | Customer photos client-side only in MVP; no undisclosed data collection. |
| NFR-05 | Scalability | Stateless serverless backend; horizontally scalable DB (Neon). |
| NFR-06 | Accessibility | WCAG baseline: focus-visible rings, skip-link, semantic landmarks, ARIA tabs/dialogs, `prefers-reduced-motion`. |
| NFR-07 | SEO/OGC | Metadata, Open Graph, Twitter cards, sitemap.xml, robots.txt, OG image generator. |
| NFR-08 | Responsiveness | Mobile-first: 320px→1440px+. |
| NFR-09 | Maintainability | Modular architecture, typed client, provider abstraction, clean-code conventions. |
| NFR-10 | Deployability | CI via Vercel; zero-config demo; `npm run build` and `lint` must pass. |
| NFR-11 | Data integrity | Foreign keys + on-delete cascade; indexes on store/category queries. |

---

## 7. Data Design (MVP)

Authoritative: `prisma/schema.prisma` (PostgreSQL).

- **Store** — id, name, slug (unique), createdAt; has many CatalogItems.
- **CatalogItem** — id, storeId, name, category, imageUrl, createdAt, sortOrder; indexed on `(storeId, category)` and `(storeId, createdAt)`.

Extended schema (future owners/QR/gallery/analytics per DATABASE.md): users, staff, products, product images, customer sessions/vertisers, try-on results, favorites, downloads, payments, subscriptions, analytics.

---

## 8. Use Case Scenarios (MVP)

1. **Guest try-on (happy path)** → User lands on hero, clicks CTA → uploads/crops photo → picks saree → /api/tryon (mock or real) → sees animated result → downloads/share.
2. **Degraded AI path** → AI provider missing key/unavailable → app returns demo image with notice; experience continues.
3. **Store lookup** → store owner page lists stores; catalog loads via /api/stores/[slug]/catalog.
4. **Edge cases** — invalid file (rejected by crop/upload), 400s on bad payloads, missing store route → 404 JSON.

---

## 9. Data & Business Rules Constraints

- Never commit `.env.local` or keys: secrets live in environment variables only.
- Never block the demo: every AI path must degrade to the mock provider.
- Image references: absolute URL or root-relative `/public` path; `max 4096` chars.
- Generated images are stored by URL only, never inline in DB.

---

## 10. Glossary

| Term             | Definition                                               |
| ---------------- | -------------------------------------------------------- |
| Try-on           | AI-generated preview of a customer wearing a selected garment |
| Provider      | Backend AI image models behind a unified interface: mock / fal / idmvton / huggingface |
| Hobby (Vercel)   | Vercel Hobby plan; serverless function max duration 60 s    |
| Jali / Royal Heritage | The brand visual system of the project (maroon + gold, lattices/mandala motifs) |

---

## 11. Known Risks / Dependencies

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Vercel Hobby 60 s function cap vs real AI cold start (IDM-VTON can take minutes) | Timeouts on real generations | Background job + webhook/callback, or higher plan limits (planned) |
| Free IDM-VTON Space slow/paused/rate-limited | Slow/failed generations | Auto-fallback + notices; fal.ai paid upgrade path |
| Neon Hobby cold start (~0.5–5 s) | First request latency | Keep demo asset; connection pool via driver config |
| No auth yet | Owner features not user-bound | Roadmap phase; keep mock store safe demo |
| Various npm audit (Next 15.5 deps, 3 high) | Supply-chain risk | Upgrade Next minor/patch, review `npm audit fix` |

---

## 12. Acceptance Criteria (MVP release)

- [ ] `npm run dev`, `npm run lint`, `npm run build` all pass.
- [ ] Landing page shows Royal Heritage theme + full section set.
- [ ] Try-on studio end-to-end works with `AI_PROVIDER=mock` (no keys).
- [ ] Try-on calls at least one real provider when keyed (fal or idmvton).
- [ ] Catalog APIs backed by Neon return seeded demo store.
- [ ] No secrets in repo; `.env.local` gitignored.
- [ ] Page works on mobile breakpoints and honours reduced-motion.

---

*End of document. This SRS is a living document — update when scope or implemented features change.*