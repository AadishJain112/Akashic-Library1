# Akashic Library: 3D Frontend Architecture & Implementation Plan

## 1. Executive Summary & Architecture Overview
The Akashic Library frontend is a production-quality, 3D-first single-page application built with React, TypeScript, Vite, Tailwind CSS, Three.js / React Three Fiber (R3F) and CSS 3D transforms. It connects to the Django REST Framework backend via session authentication and CSRF token propagation, with full support for an offline/demo mock mode via MSW (Mock Service Worker).

### Core Architectural Principles
1. **Zero Backend Alteration**: All backend files, test suites, database models, and the root `.env` remain untouched.
2. **Hybrid 3D Strategy**:
   - **R3F / Three.js**: Spatial environments (Grand Library Hall hero, personal library room, warden's tower, stockroom crates), procedural book meshes, particle dust motes, and lighting effects.
   - **CSS 3D Transforms**: Book cover displays with dynamic/remote cover images (avoiding CORS texture taint issues from Google Books / Open Library), smooth flip/tilt interactions, and accessible DOM structures.
   - **Accessible Overlay Layer**: All real text, forms, tables, inputs, and interactive controls live in semantic DOM layers with full keyboard and screen-reader accessibility (`aria-label`, visible focus rings).
   - **Lite 3D Mode & Reduced Motion**: Instant fallback to lightweight CSS-3D or 2D layouts for low-power devices, users preferring reduced motion, or WebGL context failures.
3. **Session & Cookie CSRF Handling**:
   - Dev server on port `3000` proxies `/api` to `http://localhost:8000` with `changeOrigin: false`.
   - Credentials included on all requests (`credentials: 'include'`).
   - `X-CSRFToken` read from `csrftoken` cookie and attached to unsafe methods (`POST`, `PATCH`, `PUT`, `DELETE`).
   - Graceful 403 handling on initial `/api/auth/me/` boot (indicating unauthenticated visitor, not system failure).

---

## 2. Route Map & Role Guard Matrix

| Route | View Name | Audience / Guards | 3D Scene / Visual Highlight |
|---|---|---|---|
| `/` | Grand Reading Hall (Home) | Public | 3D Grand Library Hall, orbiting jewel-tone books, light shafts, coverflow carousel |
| `/login`, `/register` | The Library Card | Guest only (redirect if auth) | 3D Interactive Library Card with flip animation, brass lamp backdrop |
| `/catalogue` | The Stacks | Public | 3D Bookshelf spine wall, pull-out preview, shelf/coverflow/grid switcher |
| `/books/:id` | The Reading Desk | Public (Private actions) | Interactive 3D Tome (drag rotate, open cover, page-flip), 3D rating book-tower histogram |
| `/bookshop` | The Bookshop | Public | 3D Shop interior with book display tables and brass price tags |
| `/bookshop/:productId` | Product Showcase | Public (Buy: Auth) | 3D Product showcase, condition badge, flying-book-to-trolley animation |
| `/circle` | The Reading Circle | Public (Post: Auth) | 3D Amphitheatre / parchment notice scrolls wall |
| `/circle/:id` | Scroll & Discussion | Public (Reply: Auth) | 3D Unrolling parchment scroll, stacked book-spine replies |
| `/shelves` | Personal Library Room | Auth (USER+) | 3D Library Room with 3 wooden bookcases (Want to Read, Reading, Read) & glass Favorites case |
| `/picks` | Librarian's Picks | Auth (USER+) | 3D Curved reading wheel / revolving bookcase with recommendation ribbons |
| `/trolley` | The Book Trolley | Auth (USER+) | 3D Wooden book trolley with stacked physical books |
| `/checkout` | The Parcel Desk | Auth (USER+) | 3D Parcel packaging animation (wrapping paper, twine, wax seal) |
| `/parcels` | Parcel Shelves | Auth (USER+) | 3D Shelves of wrapped parcel boxes with wax seals and status stamps |
| `/parcels/:id` | Unwrapped Parcel | Auth (USER+) | 3D Unwrapping box revealing itemized parchment receipt |
| `/card` | My Library Card | Auth (USER+) | 3D Embossed library card with role-specific wax seal, flip to backside stats |
| `/import` | Acquisitions Desk | Auth (USER+) | 3D Book arriving and sliding onto intake shelf |
| `/stockroom` | The Stockroom | STORE_MANAGER, ADMIN | 3D Wooden crate storage stacks with inventory fill gauges |
| `/moderation` | The Warden's Tower | MODERATOR, ADMIN | Midnight plum chamber with warm brass lantern light, desk of report scrolls |
| `*` | 404 Misplaced Book | Public | 3D Empty bookshelf gap with tumbled book and magnifying glass |

---

## 3. Component Architecture & Directory Structure

```
frontend/
├── public/
│   ├── favicon.svg
│   └── mockServiceWorker.js
├── src/
│   ├── api/
│   │   ├── http.ts                 # Axios / Fetch client, CSRF header, 503 retry, normalizeError
│   │   ├── adapters.ts             # RecBook / BookListItem / LibraryEntry / StoreProduct normalization
│   │   ├── auth.ts                 # /api/auth/ endpoints (register, login, logout, me)
│   │   ├── books.ts                # /api/books/ (search, detail, rating, import)
│   │   ├── reviews.ts              # /api/books/<id>/reviews/ (CRUD)
│   │   ├── library.ts              # /api/library/ (shelves, add, update, remove, favorite)
│   │   ├── store.ts                # /api/store/products/ (catalog & staff manage)
│   │   ├── cart.ts                 # /api/cart/ (active cart & items)
│   │   ├── orders.ts               # /api/checkout/ & /api/orders/
│   │   ├── community.ts            # /api/community/ (discussions, replies, reports)
│   │   └── recommendations.ts      # /api/recommendations/ (picks, similar, external)
│   ├── app/
│   │   ├── Router.tsx              # React Router v6 setup with route guards
│   │   ├── Layout.tsx              # Navbar, main room container, footer colophon, ambient canvas
│   │   ├── AuthContext.tsx         # User state, role helpers, login/logout actions
│   │   ├── ThemeContext.tsx        # Reading Light mood switcher & Lite 3D toggle
│   │   └── QueryClient.tsx         # TanStack React Query configuration
│   ├── components/
│   │   ├── three/
│   │   │   ├── CanvasContainer.tsx # Safe R3F wrapper with WebGL error boundary & Lite mode switch
│   │   │   ├── GrandHallScene.tsx  # Hero 3D library hall with floating books and arched windows
│   │   │   ├── Book3DProcedural.tsx# Procedural 3D cloth-bound book mesh with page block & ribbon
│   │   │   ├── BookShelf3D.tsx     # 3D wooden shelves with instanced book spines
│   │   │   ├── TrolleyScene3D.tsx  # 3D book trolley
│   │   │   ├── ParcelScene3D.tsx   # 3D parcel boxes with wax seals
│   │   │   ├── StockroomScene3D.tsx# 3D wooden crates with fill indicators
│   │   │   ├── TowerScene3D.tsx    # Night watch moderation tower
│   │   │   └── DustParticles.tsx   # Atmospheric floating dust motes and light rays
│   │   ├── css3d/
│   │   │   ├── BookCard3D.tsx      # CSS 3D interactive book: tilt on hover, real cover, generated spine
│   │   │   ├── LibraryCard3D.tsx   # CSS 3D flippable reader identification card
│   │   │   ├── ScrollCard3D.tsx    # CSS 3D parchment scroll for discussions
│   │   │   └── Coverflow3D.tsx     # CSS 3D coverflow carousel
│   │   ├── domain/
│   │   │   ├── BookRatingTower.tsx # 3D book stack histogram (1-5 stars)
│   │   │   ├── ReaderCard.tsx      # Micro-profile popover for authors
│   │   │   ├── ShelfSelector.tsx   # Shelf add/move buttons + drag targets
│   │   │   ├── ReviewComposer.tsx  # Inkwell & quill review editor with spoiler toggle
│   │   │   ├── DiscussionComposer.tsx # Community discussion creator
│   │   │   ├── ReportDialog.tsx    # Content report modal with preset chips
│   │   │   ├── ProductCard.tsx     # Shop item with price tag and availability ribbon
│   │   │   ├── TrolleyItemRow.tsx  # Cart row with joined book metadata
│   │   │   └── OrderReceipt.tsx    # Parchment invoice with snapshot line items
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx           # Drop-down ribbon bookmark toasts
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx
│   │       └── ErrorFallback.tsx
│   ├── hooks/
│   │   ├── useBooks.ts             # Batch-fetching and caching books by IDs
│   │   ├── useCartCount.ts         # Live cart badge updater
│   │   └── useLite3D.ts            # Hardware/preference detection for Lite 3D
│   ├── mocks/
│   │   ├── handlers.ts             # MSW mock handlers covering all backend APIs
│   │   ├── mockData.ts             # Seeded mock dataset for guest, user, mod, manager, admin
│   │   └── browser.ts              # MSW worker initialization
│   ├── styles/
│   │   └── index.css               # Tailwind directives, CSS variables, paper textures, 3D transforms
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Visual Design System & Palette

- **Theme**: Warm, sunlit grand reading hall. Never brutalist (no harsh black borders, no raw monospace, no jarring neo-brutalist pop shadows). Soft layered shadows, parchment grain, warm wood, and brass.
- **Ambient Lighting Moods** (switchable in Reading Light menu, saved to `localStorage`):
  1. *Morning Study*: Warm cream (`#FBF4E6`), soft cerulean sky highlights, pale oak.
  2. *Golden Hour*: Honey amber (`#F6EAD3`), rose gold accents, rich walnut.
  3. *Garden Reading Room*: Fresh ivory (`#FFFDF7`), sage and mint accents, natural wood.
- **Jewel-tone Book Spines**: Emerald (`#1F8A70`), Ruby (`#C2334D`), Sapphire (`#2F5DA8`), Amethyst (`#7A4FB5`), Saffron (`#F0A21B`), Teal (`#17939A`), Rose (`#E26D8B`), Forest (`#3F7D3A`), Terracotta (`#D2693C`).
- **Dark Accent Allowance**: Allowed only in the Home skylight oculus and the Moderation Desk's Warden's Tower (midnight plum `#1E152A`).

---

## 5. Backend Gaps & Adaptations Strategy

1. **No Profile Update**: Account screen presents an elegant read-only 3D Library Card with a helpful "Official records are issued by the Chief Librarian" note.
2. **Community Author Identity**: The backend provides only `author_user_id`. We derive a deterministic avatar palette, heraldic icon, and label ("Reader · a1b2" or "You (username)" for self).
3. **No Favorites Endpoint**: Favorited books are extracted from `/api/library/` entries where `favorited: true`. Favoriting an unshelved book triggers a friendly toast offering to add it to "Want to Read".
4. **Product Metadata Join**: Products and cart items store only `book_reference`. The `useBooks` hook batches and caches calls to `/api/books/<book_reference>/`, displaying a realistic embossed cloth book skeleton until fetched.
5. **Community Flat Array vs Envelope Pagination**: Community endpoints (`discussions`, `replies`, `reports`) use `skip/limit` returning flat arrays; books, library, store, and reviews return standard DRF envelopes (`count, next, previous, results`). Both patterns are cleanly normalized.
6. **Community Floats vs ISO Timestamps**: Community models use epoch timestamps in seconds (`float`); library/reviews use ISO strings. A shared `formatDate` utility handles both seamlessly.

---

## 6. Implementation Phases

- **Phase 1: Foundation & Scaffolding**
  - Package dependencies setup (Vite, React 18/19, Three.js, R3F, Drei, Lucide icons, Tailwind, React Query).
  - Proxy configuration on port 3000 (`changeOrigin: false`).
  - HTTP client with CSRF token auto-attachment, error normalizer, and AuthContext with `/api/auth/me/` bootstrap.
  - Shell layout with wooden-brass navbar, drawer search, reading light mood switcher, and footer status lamp.
- **Phase 2: Authentication & Identity**
  - 3D Library Card for Login / Registration with flip animation.
  - Account Card view with role-specific wax seals and stats.
- **Phase 3: Book Discovery & The Stacks**
  - Home Grand Library Hall scene (3D hall, floating books, coverflow, room cards).
  - Catalogue: 3 views (Shelf spines, Coverflow, Grid cards), card-catalogue filter drawer, pagination.
  - Book Detail: Interactive 3D Tome, cover carousel, rating tower histogram, shelf adder, favorite bookmark, buy chip, external portals.
- **Phase 4: Personal Library & Acquisitions**
  - My Shelves: 3 wooden shelf units + Favorites glass cabinet, move/remove controls.
  - Librarian's Picks (Recommendations) with reason ribbons.
  - Acquisitions Desk: Import book by Google Books / Open Library ID.
- **Phase 5: Community & The Reading Circle**
  - Reading Circle discussions scroll wall with topic chips and anti-spam guard.
  - Discussion detail with unrolling scroll, threaded comment slips, edit/delete, report dialog.
  - Reviews CRUD with inkwell & quill composer and velvet spoiler curtain.
- **Phase 6: Store, Trolley & Orders**
  - Bookshop showcase with price tags and condition/edition badges.
  - Cart with 3D wooden trolley, live pricing, stock validation.
  - Checkout with simulated payment notice, 3D parcel wrapping sequence.
  - Parcel Desk order history and receipt unrolling.
- **Phase 7: Staff Management & Guarded Wings**
  - Stockroom: Crate storage view, product creation, inventory update gauges.
  - Moderation Tower: Midnight plum chamber, report cards, hide/restore and resolve actions.
  - 403 Restricted Section & 404 Misplaced Book screens.
- **Phase 8: MSW Mock Mode & Polish**
  - MSW mock server covering all endpoints for standalone offline testing (`VITE_USE_MOCKS=true`).
  - Lite 3D fallback mode, reduced-motion compliance, WebGL error boundary.
  - Final verification: git diff verification ensuring zero changes outside `frontend/` and byte-for-byte root `.env` preservation.
