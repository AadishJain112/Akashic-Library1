# Akashic Library — 3D React Frontend

*Discover. Read. Connect. Shop.*

A production-grade, 3D-first React + Vite frontend for the Akashic Library platform, built with Three.js, React Three Fiber (R3F), CSS 3D transforms, Tailwind CSS, and TanStack React Query.

---

## 1. Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm or pnpm

### Installation
From the repository root:
```bash
cd frontend
npm install
```

### Running in Development
The frontend development server must run on **port 3000** (default configured in `vite.config.ts`), matching the backend CORS configuration:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Dev Server Proxy & CSRF Configuration

### Why the Proxy is Crucial
The Django backend sets session authentication cookies and relies on Django's CSRF origin checks.
Because the backend does not set `CSRF_TRUSTED_ORIGINS`, cross-origin POST/PATCH writes from a different origin would fail Django's origin validation.

To solve this completely within the frontend workspace without altering the backend:
- Vite's dev server on port `3000` is configured with `server.proxy` to forward `/api` to `http://localhost:8000`.
- The proxy setting uses **`changeOrigin: false`**, ensuring the `Host` header remains `localhost:3000` and matches the `Origin: http://localhost:3000` header sent by the browser.
- All HTTP calls in the frontend use relative paths (e.g. `/api/auth/me/`).
- Session cookies (`sessionid` and `csrftoken`) are automatically retained with `credentials: 'include'`.
- The HTTP client extracts `csrftoken` from `document.cookie` and transmits the `X-CSRFToken` header on all unsafe requests (`POST`, `PATCH`, `PUT`, `DELETE`).

---

## 3. Environment Variables

Create `frontend/.env.local` (or copy `frontend/.env.example`):
```ini
# Base API URL: Leave empty to proxy relative /api requests through Vite dev server
VITE_API_BASE_URL=

# Target backend host for Vite proxy (default: http://localhost:8000)
VITE_BACKEND_TARGET=http://localhost:8000

# Set to 'true' to run with standalone MSW mock service worker (no backend needed)
VITE_USE_MOCKS=false
```

---

## 4. Standalone Mock Mode (MSW)

If you want to demo or test the entire application without spinning up Django, PostgreSQL, and MongoDB:
1. In `frontend/.env.local` (or in your terminal):
   ```ini
   VITE_USE_MOCKS=true
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Mock Service Worker intercepts `/api/*` requests and serves realistic mock data, including:
   - 4 seeded patron roles: `reader` (USER), `warden` (MODERATOR), `manager` (STORE_MANAGER), `admin` (ADMIN).
   - 8 rich manuscripts with covers, ratings, and distribution histograms.
   - Reading Circle discussions with replies.
   - Physical store editions with inventory stock tracking.
   - Interactive book trolley and simulated parcel checkout.
   - Full moderation desk with report status workflows.

---

## 5. Visual Design & 3D Strategy

- **Aesthetic**: Grand Library Reading Hall — warm parchment, honey oak, brass accents, and jewel-tone book spines. Avoids brutalism (no harsh offset pop-shadows, raw monospace, or heavy black borders).
- **Ambient Light Switcher**: Toggle between *Morning Study*, *Golden Hour*, and *Garden Reading Room* (persisted in `localStorage`).
- **Hybrid 3D Pipeline**:
  - **Three.js / React Three Fiber**: Grand hall hero with orbiting jewel books, 3D wooden trolley, parcel wrapping stations, stockroom crate stacks, and the midnight plum Warden's Tower.
  - **CSS 3D Transforms**: Book cover displays with real external covers (preventing CORS WebGL canvas taint) and 3D flippable reader charter cards.
  - **Lite 3D Mode**: One-click high-performance mode that simplifies WebGL scenes to lightweight CSS 3D/2D equivalents for battery saving or low-power hardware. Respects `prefers-reduced-motion`.
  - **WebGL Error Boundaries**: Failures in GPU rendering gracefully fall back to 2D parchment illustrations without crashing the interface.

---

## 6. Architecture & Directory Structure

```
frontend/
├── public/                 # Favicon and mockServiceWorker.js
├── src/
│   ├── api/                # Typed DRF API clients, HTTP client, and error normalizers
│   │   ├── http.ts         # Credentials, CSRF header attachment, retry logic, normalizeError
│   │   ├── adapters.ts     # Procedural cover generation, price/date formatting, identity tags
│   │   ├── auth.ts         # Register, login, logout, me, health lamp
│   │   ├── books.ts        # Catalogue search, detail, rating, import
│   │   ├── reviews.ts      # Book reviews CRUD
│   │   ├── library.ts      # Personal library shelves & favorites
│   │   ├── store.ts        # Bookshop products & staff inventory
│   │   ├── cart.ts         # Active cart items & quantity adjustments
│   │   ├── orders.ts       # Checkout & order receipts
│   │   ├── community.ts    # Reading circle discussions, replies, reports
│   │   ├── recommendations.ts # Librarian picks, similar books, external links
│   │   └── moderation.ts   # Warden reports, hide/restore content
│   ├── app/                # Router, AuthContext, ThemeContext, Navbar, Footer, Layout
│   ├── components/
│   │   ├── three/          # R3F WebGL scenes (GrandHall, Book3D, Trolley, Parcel, Tower)
│   │   ├── css3d/          # CSS 3D Books, LibraryCard3D, Coverflow3D
│   │   ├── domain/         # Rating tower histogram, ReaderCard, ReportDialog
│   │   └── ui/             # Buttons, inputs, modals, ribbon bookmark toasts, badges
│   ├── features/           # Route views (Home, Catalogue, Book, Shelves, Circle, Store, etc.)
│   ├── hooks/              # useBooks (deduped batch join), useCartCount, useLite3D
│   ├── mocks/              # MSW browser worker, handlers, and seeded database
│   ├── styles/             # Tailwind directives, parchment textures, and 3D transforms
│   ├── App.tsx             # Root application shell
│   └── main.tsx            # Entry point with optional MSW initialization
├── PLAN.md                 # Full architecture & implementation plan
├── vite.config.ts          # Port 3000, Vite proxy, and rollup chunk optimization
└── package.json
```

---

## 7. Known Backend Gaps & Adaptations

1. **No Profile Update Endpoint**: The patron library card is rendered read-only with a gentle explanatory note.
2. **Community Authors Expose Only User IDs**: The frontend generates deterministic jewel-tone heraldic avatars and tags (`Reader · a1b2`) or `You (username)`.
3. **Store Products & Cart Items Have No Titles or Covers**: The `useBooks(ids[])` hook automatically batches and caches calls to `/api/books/<id>/` and joins metadata.
4. **No Server-Side Library Status Filter**: All pages are fetched and grouped into Want to Read, Reading, and Read client-side.
5. **No Single Reply / Report Detail GET Endpoint**: Moderation displays contextual report metadata and links to the parent discussion scroll.
6. **Simulated Payment System**: Checkout is a single-click confirmation (`POST /api/checkout/`) without collecting credit cards or physical addresses.
