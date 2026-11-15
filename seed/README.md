# Akashic Library: Demo Accounts & Realistic Seed Data

This directory contains the standalone demo seeding tool for the Akashic Library project. It creates realistic demo accounts covering every user role, along with comprehensive data across PostgreSQL and MongoDB, so that all screens of the web application show rich, meaningful content immediately upon login.

---

## Prerequisites

Before running the seed script, ensure:
1. **Virtual Environment is active**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
2. **Databases are running**:
   - PostgreSQL running locally on port `5432` with database `akashic_library`.
   - MongoDB running locally on port `27017` with database `akashic_discovery`.
3. **Database migrations are applied**:
   ```powershell
   python manage.py migrate
   ```

---

## Commands

Run all commands from the repository root:

```powershell
# 1. Create or update demo data idempotently
python seed/seed_demo.py

# 2. Reset ONLY seed-created demo data (leaves real users and data intact)
python seed/seed_demo.py --reset

# 3. Clean reset followed by a fresh seeding
python seed/seed_demo.py --fresh

# 4. Bypass safety guards (DEBUG=False or non-local database host)
python seed/seed_demo.py --force
```

---

## Demo Credentials Table

All demo accounts share the single demo password: **`Akashic@Demo2026`**

| Username | Email | Role | Display Name | Permissions / Access |
|---|---|---|---|---|
| `demo_admin` | `demo_admin@example.com` | `ADMIN` | Ada Admin | Full access (`is_staff=True`, `is_superuser=True`). Can access `/admin/`, Stockroom, and Moderation Desk. |
| `demo_moderator` | `demo_moderator@example.com` | `MODERATOR` | Maya Moderator | Access to Moderation Desk (`/api/community/moderation/`). Can review reports, hide/restore posts. |
| `demo_storemanager` | `demo_storemanager@example.com` | `STORE_MANAGER` | Sam Stockwell | Access to Stockroom management (`/api/store/products/<id>/manage/`). |
| `demo_reader` | `demo_reader@example.com` | `USER` | Riya Reader | **Main showcase account**. Richest data across shelves, picks, cart, orders, reviews, and circle. |
| `demo_reader2` | `demo_reader2@example.com` | `USER` | Arjun Bookworm | Supporting reader. Tastes focused on engineering, algorithms, and hard sci-fi. |
| `demo_reader3` | `demo_reader3@example.com` | `USER` | Neha Pageturner | Supporting reader. Tastes focused on fantasy, thrillers, and Indian literature. |

---

## Seeded Data Overview

### 1. Book Catalogue (MongoDB `books`)
- **28 curated books** covering diverse genres (Classics, Dystopian, Sci-Fi, Fantasy, Mystery, Computer Science, Self-Help, Psychology, Science, Indian Literature).
- Authentic Open Library cover URLs based on ISBN-13 (`https://covers.openlibrary.org/b/isbn/<ISBN13>-L.jpg`).
- Books 27 (*The God of Small Things*) and 28 (*The Palace of Illusions*) intentionally have no covers to exercise the frontend's procedural fallback.

### 2. Bookshop (PostgreSQL `store`)
- **16 store products** mapped to catalogue books via `book_reference`:
  - 8 × `IN_STOCK` (quantities 10 to 40)
  - 3 × `LOW_STOCK` (available stock 1 to 4)
  - 2 × `OUT_OF_STOCK` (available stock 0)
  - 2 × `PREORDER`
  - 1 × `DISCONTINUED` (hidden from public catalogue)
- Realistic pricing and formats (Paperback, Hardcover, Collector's Edition, Student Edition, Anniversary Edition).

### 3. Account Profiles & Reading Shelves
- **`demo_reader`**:
  - 14 books shelved across `WANT_TO_READ` (4), `READING` (3), and `READ` (7).
  - 5 Favorites (all present on shelves).
  - 7 Reviews on read books with mixed ratings (5, 5, 4, 4, 4, 3, 2), spoilers, and thoughtful long critiques.
  - Active Cart with 2 products (quantities 1 and 2).
  - 3 Historical Orders: 1 `CONFIRMED`/`PAID`, 1 `PENDING`/`PENDING`, 1 `CANCELLED`/`FAILED`.
- **`demo_reader2` & `demo_reader3`**:
  - 9+ books shelved, 3 favorites each, 6+ reviews each.
  - Ensures at least 9 books have multiple reviews for realistic histograms and averages.
- **`demo_moderator`, `demo_storemanager`, `demo_admin`**:
  - Personal shelves (5 books, 2 favorites), reviews, carts, and orders.

### 4. Reading Circle & Moderation Desk (MongoDB `community`)
- **12 Discussions** across varied topics (`GENERAL`, `BOOK_CLUB`, `RECOMMENDATIONS`, `QUESTIONS`, `NEWS`).
- **30 Replies** creating natural conversational threads.
- Back-dated timestamps (epoch floats over the past 30 days).
- **Moderation Desk Data**:
  - 2 `PENDING` reports (one on discussion, one on reply).
  - 1 `RESOLVED` report with moderator resolution note.
  - 1 `DISMISSED` report with moderator note.
  - 1 `HIDDEN` discussion demonstrating moderation filtering and audit logging.

---

## Safety Guards

The seed script protects production and remote databases:
- **`DEBUG=True` Check**: Refuses to run if `settings.DEBUG` is `False`.
- **Local Host Check**: Refuses to run if PostgreSQL host or MongoDB URI points to non-local endpoints (must be `localhost`, `127.0.0.1`, or `::1`).
- **Safe Reset**: `--reset` targets only deterministic seed IDs and demo usernames (`demo_*`). It never touches real users or existing data.
- **`--force` Flag**: Overrides safety checks with an explicit console warning.
