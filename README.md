# Land Caller — 1:1 TypeScript MVC Replica

A pixel-for-pixel, behaviour-for-behaviour reproduction of
[`landcaller.manus.space`](https://landcaller.manus.space) rebuilt as a
**server-side-rendered Node.js + TypeScript MVC application**.

The original is a single-page React/Vite app. This project reproduces it exactly
using Express + EJS server-side rendering, the original compiled stylesheet for
guaranteed visual parity, locally hosted assets, and a small framework-free
TypeScript client bundle for the interactive pieces. The cloned marketing site
uses **no database or persistence layer** — the source site persists nothing (its
contact form shows a toast and resets), so neither do we. The one addition beyond
the 1:1 clone is an optional **blog CMS** (`/admin`) backed by file-based SQLite
(Node’s built-in `node:sqlite`, no third-party database); it’s entirely opt-in and
the site runs without it (see §5).

Verified parity: full-page rendered height matches the original **to the pixel**
at desktop (9708px) and mobile (13541px), confirmed via headless-Chrome
screenshot diffing.

---

## 1. Project Blueprint

### 1.1 Architecture overview

```
Browser
  │  HTTP GET /
  ▼
Express app (src/app.ts)
  ├─ static middleware ──────────►  /assets/** (css, js, images)
  └─ Router (src/routes) ─────────►  Controller (src/controllers)
                                        │ builds view-model from Models (src/models, src/config)
                                        ▼
                                     EJS Views (src/views) ── layout + reusable partials
                                        ▼
                                     HTML response (fully rendered, SEO-ready)

Browser (after load)
  └─ /assets/js/main.js (compiled from src/client) drives:
       scroll-aware header · mobile menu · package accordions ·
       FAQ accordion (single/collapsible) · contact toast
```

- **Model** — typed content/config modules (`src/models`, `src/config`). Pure
  data, no rendering logic.
- **View** — EJS layout (`home.ejs`) + one partial per UI section + a reusable
  icon partial. Markup/classes reproduce the source DOM exactly.
- **Controller** — assembles the view-model and renders (`homeController`,
  `contactController`).

### 1.2 Technology stack

| Concern            | Choice                          | Why                                                        |
| ------------------ | ------------------------------- | ---------------------------------------------------------- |
| Language           | TypeScript (strict)             | Required; type-safe models/controllers                    |
| Runtime/server     | Node.js ≥ 18 + Express 4        | Lightweight MVC HTTP server                               |
| Templating (View)  | EJS                             | SSR, partials/includes, plain-HTML fidelity              |
| Styling            | Original compiled Tailwind CSS  | Exact visual parity (reused as a static asset, untouched) |
| Fonts              | Google Fonts (Playfair + Inter) | Identical `<link>` to the source                          |
| Client interactivity | TypeScript → esbuild IIFE bundle | Tiny (~5 KB), framework-free, matches source behaviour   |
| Dev tooling        | tsx (watch), esbuild, rimraf    | Fast TS execution + bundling                              |
| Tests              | `node:test` + Puppeteer scripts | Functional smoke tests + visual diffing                  |

### 1.3 Folder structure

```
landcaller/
├─ public/                     # served at /assets
│  └─ assets/
│     ├─ css/index.css         # original compiled stylesheet (verbatim)
│     ├─ js/main.js            # built client bundle (from src/client)
│     └─ images/               # logo, favicon, hero laptop mockup
├─ src/
│  ├─ server.ts                # entry: boots HTTP server
│  ├─ app.ts                   # Express app: engine, static, routes, middleware
│  ├─ config/
│  │  └─ site.ts               # site meta, nav links, external links, footer links
│  ├─ models/
│  │  ├─ types.ts              # shared domain types (the data contracts)
│  │  └─ content.ts            # all section content (hero, packages, faqs, …)
│  ├─ controllers/
│  │  ├─ homeController.ts      # builds home view-model + renders
│  │  └─ contactController.ts   # no-JS contact fallback (no persistence)
│  ├─ routes/
│  │  └─ index.ts              # route → controller table
│  ├─ views/
│  │  ├─ home.ejs              # document shell / layout
│  │  └─ partials/
│  │     ├─ _icons.ejs         # reusable lucide icon renderer
│  │     ├─ header.ejs hero.ejs who-we-are.ejs what-sets-apart.ejs
│  │     ├─ testimonials.ejs comparison.ejs packages.ejs features.ejs
│  │     └─ faq.ejs affiliate.ejs contact.ejs footer.ejs
│  └─ client/
│     └─ main.ts               # browser interactions (compiled to public/assets/js)
├─ scripts/copy-views.mjs      # copies views into dist on build
├─ tests/smoke.test.js         # server/render/route smoke tests
├─ tsconfig.json  package.json  .gitignore  README.md
```

### 1.4 Development workflow

```bash
npm install            # install dependencies
npm run dev            # build client once + run server with TS hot-reload (tsx watch)
#   in a second terminal for live client rebuilds:
npm run dev:client     # esbuild --watch on src/client

npm run build          # clean → tsc (server) → copy views → esbuild (client) → dist/
npm start              # run the compiled server (dist/server.js)  →  http://localhost:3000

npm run typecheck      # tsc --noEmit
npm test               # node:test smoke tests (run after build)
```

### 1.5 Deploy to Vercel

This project is configured for [Vercel](https://vercel.com) with Express SSR via a
serverless function and static assets from `public/`.

| File | Purpose |
| ---- | ------- |
| `vercel.json` | Build command + rewrite all dynamic routes to `/api` |
| `api/index.ts` | Serverless entry — exports the Express app from `dist/app.js` |
| `.vercelignore` | Excludes local-only folders from upload |

**Deploy steps**

1. Push the repo to GitHub ([Landcaller-website](https://github.com/MagdyKishk314/Landcaller-website)).
2. In Vercel: **Add New Project** → import the repo.
3. Use the defaults (Vercel reads `vercel.json`):
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output:** static files from `public/` + serverless `api/`
4. Deploy. The marketing site needs **no environment variables**. The blog CMS
   (`/admin`) needs `ADMIN_PASSWORD` and `SESSION_SECRET` (set them in **Project →
   Settings → Environment Variables**). Note: on Vercel the SQLite store is a
   read-only demo — host on a VPS for a persistent editable blog (see §5).

**CLI (optional)**

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production
```

**Notes**

- `public/assets/js/main.js` is built during deploy (not committed); CSS/images are in git.
- `dist/` and views are generated by `npm run build` before the function runs.
- Local dev is unchanged: `npm run dev` or `npm start` after `npm run build`.

---

## 2. Detailed Task Breakdown

### 2.1 Discovery & analysis (done)
- Rendered the SPA with headless Chrome; captured the full post-hydration DOM.
- Inventoried network assets (CSS, JS, fonts, images, analytics).
- Extracted JS-only content not present in the closed-state DOM (FAQ answers,
  package feature descriptions) directly from the source bundle.
- Mapped React component tree (via `data-loc` attributes) → server partials.

### 2.2 Route creation
- `GET /` → home page (the entire single-page site).
- `POST /contact` → progressive-enhancement fallback (returns JSON / redirects);
  the JS client matches the original (toast + reset, no network) when enabled.

### 2.3 Controller implementation
- `homeController.renderHome` composes the typed view-model and renders `home`.
- `contactController.submitContact` handles the no-JS path without persistence.

### 2.4 View development
- One document layout (`home.ejs`) including 12 section partials + shared icon
  partial. Repeating UI (cards, rows, tiers, FAQ items, feature matrix) is
  data-driven via EJS loops over the models.

### 2.5 Asset migration
- Original Tailwind CSS copied verbatim to `public/assets/css/index.css`.
- Logo (PNG), favicon (WebP) and hero laptop mockup (WebP) downloaded locally.
- Google Fonts kept as the identical `<link>` for byte-identical typography.

### 2.6 Functionality replication
- Scroll-aware fixed header (transparent → `bg-[#0A0A0A]/98 backdrop-blur` past 20px).
- Mobile hamburger menu (open/close + icon swap).
- Package feature accordions (toggle detail, chevron rotate/recolor).
- FAQ accordion (`type=single`, collapsible) using the original Radix keyframes.
- Contact form: client toast “Message sent! We'll be in touch shortly.” + reset.

### 2.7 Testing & validation
- `node:test` smoke tests (routes, section presence, SSR FAQ answers, assets).
- Puppeteer screenshot diff (desktop + mobile) and interaction assertions.

---

## 3. Dependency Map

### Route → Controller
| Route           | Controller                        |
| --------------- | --------------------------------- |
| `GET /`         | `homeController.renderHome`       |
| `GET /about`    | `aboutController.renderAbout`     |
| `GET /about-us` | 301 redirect → `/about`           |
| `POST /contact` | `contactController.submitContact` |

### Controller → View → Model
| Controller    | View        | Models consumed                                                                 |
| ------------- | ----------- | ------------------------------------------------------------------------------- |
| `renderHome`  | `home.ejs`  | `config/site` (site, navLinks, footerLinks), `models/content` (hero, whoWeAre, whatSetsApart, testimonials, comparisonRows, packages, featureMatrix, faqs, affiliateTiers, contactFields) |
| `renderAbout` | `about.ejs` | `config/site` (site, navLinks, footerLinks), `models/about` (about, team)        |

Both pages share the `_head.ejs`, `header.ejs` and `footer.ejs` partials. The
header/footer are page-aware (`isHome`): in-page `#` anchors stay relative on the
home page and resolve to `/#…` on sub-pages so cross-page navigation works.

### View → Partials
`home.ejs` → `header, hero, who-we-are, what-sets-apart, testimonials,
comparison, packages, features, faq, affiliate, contact, footer`; every partial
that renders an icon → `_icons.ejs`.

### Shared components & assets
- `_icons.ejs` (lucide SVG set) — reused by 9 partials.
- Button class recipes, card/grid structures — repeated via loops + locals.
- `/assets/css/index.css`, `/assets/js/main.js`, `/assets/images/*` — shared globally.

### External dependencies & third-party links (kept as in source)
- Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).
- Outbound links: Calendly (`calendly.com/landcaller`), CRM
  (`my.landcaller.com`), Facebook, X/Twitter.
- **Omitted intentionally:** Plausible & Manus analytics trackers (third-party
  telemetry, not part of the visual/functional surface).

---

## 4. Validation Checklist

- **Visual parity** — ✅ desktop & mobile full-page screenshots match; rendered
  page height identical to the source (9708px / 13541px).
- **Responsive behaviour** — ✅ breakpoints (`sm`/`md`/`lg`/`xl`) reproduced via
  the original CSS; mobile nav + stacked grids verified at 390px.
- **Route validation** — ✅ `GET /` 200, assets 200, `POST /contact` 200 JSON.
- **Asset validation** — ✅ CSS, JS, images, fonts all load; logos/favicon/hero present.
- **Functionality validation** — ✅ header scroll, mobile menu, package & FAQ
  accordions, contact toast + reset (Puppeteer-asserted).
- **Performance** — ✅ SSR HTML, gzip (compression middleware), immutable
  long-cache static assets, ~5 KB client bundle.
- **Cross-browser** — standards-only HTML/CSS/JS (no framework runtime); the
  reused CSS is the source's own production output.

---

## 5. Blog CMS / Admin

The blog is backed by a small CMS so posts can be written and published from the
browser — no code edits or redeploys. It’s an addition on top of the 1:1 clone;
the rest of the marketing site is unchanged and still database-free.

### How it works

- **Storage:** a single `posts` table in **SQLite**, via Node’s built-in
  [`node:sqlite`](https://nodejs.org/api/sqlite.html) — **no third-party database,
  driver, or account.** The database is one file on disk (`./data/blog.db` by
  default; override with `SQLITE_PATH`). A brand-new database is auto-seeded with
  three starter articles.
- **Auth:** one shared password (`ADMIN_PASSWORD`) gates `/admin`. The session is
  a signed, stateless cookie (`cookie-session`). All admin POSTs are
  CSRF-protected; `/admin` is `noindex`/`no-store`.
- **Authoring:** posts are written in **Markdown**, rendered to sanitized HTML
  (`marked` + `sanitize-html`) at request time. Reading time is auto-computed.
- **Publishing:** a post is public only when **Published** is checked. Published
  posts appear on `/blog`, the home teaser, and the sitemap, and are indexable.
  Drafts are hidden from the public site.
- **Graceful fallback:** if SQLite can’t be opened (an older runtime, or a
  read-only path), the public blog falls back to the static seed in
  `src/models/blog.ts` (body-less, `noindex`) so the site still renders.

> **Requirements:** Node **≥ 22.5** (`node:sqlite`). The reference VPS / your
> local Node 26 are fine.

### Deployment notes (VPS vs serverless)

- **VPS / long-running host (recommended):** the SQLite file lives on the
  persistent disk and everything just works. Point `SQLITE_PATH` at a path on a
  durable volume, e.g. `/var/lib/landcaller/blog.db`, then run `npm run db:init`
  once. This is the intended home for the CMS.
- **Vercel / serverless:** the filesystem is **ephemeral**, so writes don’t
  persist between cold starts. The app defaults to `/tmp/blog.db` and re-seeds the
  starter posts on each cold start — fine for a **read-only demo** (the public blog
  renders), but published edits won’t survive. Use a VPS for the live editable blog.

### One-time setup

1. `cp .env.example .env` and fill in:
   - `ADMIN_PASSWORD` — your admin password
   - `SESSION_SECRET` — a long random string
     (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `SQLITE_PATH` — optional; defaults to `./data/blog.db`
2. Create the database (and seed the starter articles):
   ```bash
   npm run db:seed        # create ./data/blog.db + insert starter posts
   #   or: npm run db:init  (create the file/schema only; still auto-seeds if brand-new)
   ```
3. Run the app and visit **`/admin`**:
   ```bash
   npm run dev            # or: npm run build && npm start
   ```

### Using the admin

- `GET /admin/login` — sign in with `ADMIN_PASSWORD`.
- `GET /admin` — list every post (drafts included); create, edit, publish/
  unpublish, or delete.
- New/Edit form fields: title, slug (auto-derived from the title), excerpt,
  category, **cover image** (upload via the *Browse* button, or expand “use an
  image path / URL” to reuse an `/assets/images/...` file or paste a URL),
  publish date, **Published** toggle, and the Markdown body.
- **Image uploads** are written to `public/uploads/` (served at `/uploads`),
  size-limited to 8 MB and restricted to JPG/PNG/WebP/GIF/AVIF. Override the
  location with `UPLOADS_DIR`. On a read-only serverless host the upload is
  rejected gracefully — paste an image URL there instead.

### Files

| File | Purpose |
| ---- | ------- |
| `src/config/env.ts` | Lazily-read env (dotenv locally; platform vars on Vercel) |
| `src/db/sqlite.ts` | `node:sqlite` handle, schema, auto-seed, fallback |
| `src/db/starterPosts.ts` | Starter articles (seeded into a fresh database) |
| `src/repositories/postRepository.ts` | Post reads/writes + no-DB fallback |
| `src/lib/markdown.ts` | Markdown → sanitized HTML, slugify, reading time |
| `src/middleware/auth.ts` | Session guard, password check, CSRF |
| `src/controllers/adminController.ts` | Login + post CRUD handlers |
| `src/routes/admin.ts` | `/admin` router (cookie-session, CSRF, auth) |
| `src/views/admin/*.ejs` | Login, list, and edit screens (self-contained styles) |
| `scripts/init-db.ts` | `db:init` / `db:seed` schema + starter content (via tsx) |

## Reusable duplication methodology

This repo doubles as a template for cloning any site into TS-MVC:

1. **Capture** the live DOM with headless Chrome (post-hydration) + log all
   network requests to inventory assets.
2. **Mine** the JS bundle for content that only exists at runtime (collapsed
   accordions, modals, carousels).
3. **Model** repeating content as typed data (`models/`), keep markup in views.
4. **Reuse** the target's compiled CSS as a static asset for guaranteed parity;
   localise images/fonts.
5. **Re-implement** interactions in a tiny typed client bundle.
6. **Verify** with screenshot diffing (desktop+mobile) and scripted interaction
   assertions until height/visual/behaviour match.

## Notes & assumptions
- “More Testimonials”, “More FAQ’s”, “Become An Affiliate”, “Privacy/Terms”, and
  the testimonials “view all” link point to `#` in the source — preserved as-is.
- The contact form intentionally performs **no persistence**, mirroring the
  original (toast + reset). The `POST /contact` route exists only as a graceful
  no-JS fallback.
- Analytics trackers from the source are deliberately not reproduced.
