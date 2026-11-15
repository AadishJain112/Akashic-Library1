"""
Akashic Library — Demo Accounts and Seed Data Management Script.

Usage:
    python seed/seed_demo.py            # Create or update demo data (idempotent)
    python seed/seed_demo.py --reset    # Remove ONLY the demo data created by seed
    python seed/seed_demo.py --fresh    # --reset then seed again
    python seed/seed_demo.py --force    # Bypass safety guards with warning
"""

import os
import sys
import argparse
import urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path
from decimal import Decimal
from typing import Any

# ─── 0. Bootstrap Django ───────────────────────────────────────────────────────

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Akashic_Library.settings")

import django
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction

# Model, Service, and Repository imports
from accounts.models import UserRole
from discovery.models import NormalizedBook
from discovery.repository import (
    upsert_book,
    ensure_indexes as ensure_book_indexes,
    _get_collection as get_books_collection,
)
from discovery.library_repository import (
    add_favorite,
    add_library_entry,
    update_library_entry,
    ensure_library_indexes,
    _get_library_col,
    _get_favorites_col,
)
from discovery.reviews_repository import (
    create_review,
    ensure_review_indexes,
    _get_col as get_reviews_col,
)
from discovery.exceptions import LibraryEntryExistsError, DuplicateReviewError
from discovery.db import get_db

from store.models import StoreProduct, StoreStatus, Inventory
from store.services import StoreService
from cart.models import Cart, CartItem, CartStatus
from orders.models import Order, OrderItem, Payment, OrderStatus, PaymentStatus

from community.repository import setup_indexes as setup_community_indexes
from community.constants import ModerationStatus, ReportStatus, TargetType, ModerationAction

# Seed data imports
from seed.data_users import USERS_DATA, DEMO_PASSWORD, DEMO_USERNAMES
from seed.data_books import BOOKS_DATA, BOOK_ISBN13S
from seed.data_store import STORE_PRODUCTS_DATA
from seed.data_library import LIBRARY_DATA
from seed.data_orders import CART_DATA, ORDERS_DATA
from seed.data_community import (
    DISCUSSIONS_DATA,
    REPLIES_DATA,
    MODERATION_REPORTS_DATA,
    MODERATION_AUDITS_DATA,
)

User = get_user_model()


# ─── 1. Safety Guards ──────────────────────────────────────────────────────────

def check_safety_guards(force: bool = False):
    """Enforce that seeding only runs on local environments with DEBUG=True."""
    is_debug = bool(settings.DEBUG)

    pg_host = settings.DATABASES.get("default", {}).get("HOST", "")
    pg_local = pg_host in ("", "localhost", "127.0.0.1", "::1") or pg_host.startswith("/")

    mongo_uri = getattr(settings, "MONGODB_URI", "")
    parsed_mongo = urllib.parse.urlparse(mongo_uri)
    mongo_host = parsed_mongo.hostname or ""
    mongo_local = mongo_host in ("", "localhost", "127.0.0.1", "::1")

    errors = []
    if not is_debug:
        errors.append(f"settings.DEBUG is False ({settings.DEBUG}).")
    if not pg_local:
        errors.append(f"PostgreSQL host is not local ({pg_host}).")
    if not mongo_local:
        errors.append(f"MongoDB host is not local ({mongo_host}).")

    if errors:
        msg = "SAFETY GUARD FAILED:\n  - " + "\n  - ".join(errors)
        if force:
            print("\n" + "!" * 72)
            print("WARNING: --force passed. BYPASSING SAFETY GUARDS:")
            print(msg)
            print("!" * 72 + "\n")
        else:
            raise RuntimeError(msg + "\n\nAborting. Use --force to intentionally bypass.")


# ─── 2. Reset Logic ────────────────────────────────────────────────────────────

def run_reset():
    """Safely remove ONLY the demo data created by this tool."""
    print("\n[RESET] Removing demo data created by seed...")

    # 1. Identify demo users
    demo_users = list(User.objects.filter(username__in=DEMO_USERNAMES))
    demo_user_ids = [str(u.id) for u in demo_users]
    print(f"  - Found {len(demo_users)} demo users in PostgreSQL.")

    # 2. Delete Orders and Carts for demo users
    deleted_orders, _ = Order.objects.filter(user__in=demo_users).delete()
    print(f"  - Deleted {deleted_orders} orders/order items.")
    deleted_carts, _ = Cart.objects.filter(user__in=demo_users).delete()
    print(f"  - Deleted {deleted_carts} carts/cart items.")

    # 3. Find MongoDB books seeded by ISBN-13
    db = get_db()
    books_col = get_books_collection()
    seeded_books = list(books_col.find({"identifiers.isbn13": {"$in": BOOK_ISBN13S}}, {"_id": 1}))
    seeded_book_ids = [str(b["_id"]) for b in seeded_books]
    print(f"  - Found {len(seeded_book_ids)} seeded books in MongoDB.")

    # 4. Delete Store Products associated with seeded books
    deleted_products, _ = StoreProduct.objects.filter(book_reference__in=seeded_book_ids).delete()
    print(f"  - Deleted {deleted_products} store products and inventories.")

    # 5. Delete Community collections
    disc_ids = [d["id"] for d in DISCUSSIONS_DATA]
    res_disc = db.discussions.delete_many({
        "$or": [{"_id": {"$in": disc_ids}}, {"author_user_id": {"$in": demo_user_ids}}]
    })
    reply_ids = [r["id"] for r in REPLIES_DATA]
    res_reply = db.replies.delete_many({
        "$or": [{"_id": {"$in": reply_ids}}, {"author_user_id": {"$in": demo_user_ids}}]
    })
    report_ids = [r["id"] for r in MODERATION_REPORTS_DATA]
    res_report = db.reports.delete_many({
        "$or": [{"_id": {"$in": report_ids}}, {"reporter_user_id": {"$in": demo_user_ids}}]
    })
    audit_ids = [a["id"] for a in MODERATION_AUDITS_DATA]
    res_audit = db.moderation_audits.delete_many({
        "$or": [{"_id": {"$in": audit_ids}}, {"moderator_user_id": {"$in": demo_user_ids}}]
    })
    print(f"  - Deleted {res_disc.deleted_count} discussions, {res_reply.deleted_count} replies, "
          f"{res_report.deleted_count} reports, {res_audit.deleted_count} audits.")

    # 6. Delete Reviews, Library Entries, Favorites
    rev_col = get_reviews_col()
    res_rev = rev_col.delete_many({
        "$or": [{"user_id": {"$in": demo_user_ids}}, {"book_id": {"$in": seeded_book_ids}}]
    })
    lib_col = _get_library_col()
    res_lib = lib_col.delete_many({
        "$or": [{"user_id": {"$in": demo_user_ids}}, {"book_id": {"$in": seeded_book_ids}}]
    })
    fav_col = _get_favorites_col()
    res_fav = fav_col.delete_many({
        "$or": [{"user_id": {"$in": demo_user_ids}}, {"book_id": {"$in": seeded_book_ids}}]
    })
    print(f"  - Deleted {res_rev.deleted_count} reviews, {res_lib.deleted_count} library entries, "
          f"{res_fav.deleted_count} favorites.")

    # 7. Delete Seeded Books
    res_books = books_col.delete_many({"identifiers.isbn13": {"$in": BOOK_ISBN13S}})
    print(f"  - Deleted {res_books.deleted_count} books from MongoDB.")

    # 8. Delete Demo Users
    deleted_users, _ = User.objects.filter(username__in=DEMO_USERNAMES).delete()
    print(f"  - Deleted {deleted_users} demo users from PostgreSQL.")
    print("[RESET] Cleanup complete. Real users and non-demo records were untouched.\n")


# ─── 3. Seeding Logic ──────────────────────────────────────────────────────────

def seed_users() -> dict[str, Any]:
    """Create or update the 6 demo accounts idempotently."""
    print("  [1/6] Seeding demo accounts (PostgreSQL)...")
    user_map = {}
    for data in USERS_DATA:
        username = data["username"]
        email = data["email"]
        role = data["role"]
        display_name = data["display_name"]
        bio = data["bio"]
        is_staff = data["is_staff"]
        is_superuser = data["is_superuser"]

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "role": role,
                "display_name": display_name,
                "bio": bio,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
                "is_active": True,
            },
        )
        # Always enforce consistent password and fields
        user.set_password(DEMO_PASSWORD)
        user.email = email
        user.role = role
        user.display_name = display_name
        user.bio = bio
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.is_active = True
        user.save()

        user_map[username] = user
        action = "Created" if created else "Updated"
        print(f"    - {action} user: {username} ({role})")

    return user_map


def seed_books() -> dict[str, str]:
    """Upsert the 28 curated books into MongoDB."""
    print("  [2/6] Seeding books catalogue (MongoDB)...")
    ensure_book_indexes()
    book_map = {}
    books_col = get_books_collection()

    for item in BOOKS_DATA:
        key = item["key"]
        norm_book = NormalizedBook(
            title=item["title"],
            authors=item["authors"],
            description=item["description"],
            isbn10=item.get("isbn10"),
            isbn13=item.get("isbn13"),
            publisher=item.get("publisher", ""),
            published_date=item.get("published_date", ""),
            page_count=item.get("page_count"),
            language=item.get("language", "en"),
            subjects=item.get("subjects", []),
            cover_urls=item.get("cover_urls", []),
            source_name="seed",
            source_id=key,
        )
        book_id = upsert_book(norm_book)
        # Tag book document with seed_key for exact lookup
        books_col.update_one({"_id": books_col.find_one({"identifiers.isbn13": item["isbn13"]})["_id"]},
                             {"$set": {"seed_key": key}})
        book_map[key] = book_id

    print(f"    - Upserted {len(book_map)} books in collection 'books'.")
    return book_map


def seed_store_products(book_map: dict[str, str]) -> dict[str, StoreProduct]:
    """Create or update 16 store products across all inventory statuses."""
    print("  [3/6] Seeding store products and inventory (PostgreSQL)...")
    product_map = {}

    for item in STORE_PRODUCTS_DATA:
        book_key = item["book_key"]
        book_id = book_map[book_key]
        edition = item["edition"]
        condition = item["condition"]
        price = item["price"]
        status = item["status"]
        qty = item["quantity"]
        res_qty = item["reserved_quantity"]

        existing_product = StoreProduct.objects.filter(book_reference=book_id).first()
        if existing_product:
            # Update product scalar fields
            product = StoreService.update_store_product(
                existing_product,
                edition=edition,
                condition=condition,
                price=price,
                status=status,
            )
            # Update inventory and adjust status if needed
            force_calc = (status not in (StoreStatus.PREORDER, StoreStatus.DISCONTINUED))
            StoreService.update_inventory(
                product,
                quantity=qty,
                reserved_quantity=res_qty,
                force_status_update=force_calc,
            )
            # Ensure PREORDER and DISCONTINUED stay exact
            if status in (StoreStatus.PREORDER, StoreStatus.DISCONTINUED) and product.status != status:
                product.status = status
                product.save(update_fields=["status", "updated_at"])
        else:
            product = StoreService.create_store_product(
                book_reference=book_id,
                price=price,
                edition=edition,
                condition=condition,
                status=status,
                quantity=qty,
                reserved_quantity=res_qty,
            )

        product_map[book_key] = product

    print(f"    - Seeded {len(product_map)} store products.")
    return product_map


def seed_library_and_reviews(user_map: dict[str, Any], book_map: dict[str, str]):
    """Seed reading shelves, favorites, and reviews per demo user."""
    print("  [4/6] Seeding shelves, favorites, and reviews (MongoDB)...")
    ensure_library_indexes()
    ensure_review_indexes()

    db = get_db()
    lib_col = _get_library_col()
    rev_col = get_reviews_col()
    now_utc = datetime.now(timezone.utc)

    total_shelves = 0
    total_favorites = 0
    total_reviews = 0

    for username, data in LIBRARY_DATA.items():
        user = user_map[username]
        user_id = str(user.id)

        # 1. Shelves
        for shelf_item in data.get("shelves", []):
            book_key = shelf_item["book_key"]
            status = shelf_item["status"]
            book_id = book_map[book_key]

            # Upsert shelf entry
            existing = lib_col.find_one({"user_id": user_id, "book_id": book_id})
            if existing:
                update_library_entry(user_id, book_id, status)
            else:
                try:
                    add_library_entry(user_id, book_id, status)
                except LibraryEntryExistsError:
                    update_library_entry(user_id, book_id, status)

            # Back-date shelf entry (staggered over past 30 days)
            days_ago = (total_shelves % 25) + 2
            shelf_dt = now_utc - timedelta(days=days_ago)
            lib_col.update_one(
                {"user_id": user_id, "book_id": book_id},
                {"$set": {"created_at": shelf_dt, "updated_at": shelf_dt}},
            )
            total_shelves += 1

        # 2. Favorites
        for fav_key in data.get("favorites", []):
            book_id = book_map[fav_key]
            add_favorite(user_id, book_id)
            total_favorites += 1

        # 3. Reviews
        for rev_item in data.get("reviews", []):
            book_key = rev_item["book_key"]
            book_id = book_map[book_key]
            rating = rev_item["rating"]
            title = rev_item["title"]
            body = rev_item["body"]
            spoiler = rev_item["contains_spoiler"]

            existing_review = rev_col.find_one({"user_id": user_id, "book_id": book_id})
            if not existing_review:
                try:
                    create_review(
                        user_id=user_id,
                        book_id=book_id,
                        rating=rating,
                        body=body,
                        title=title,
                        contains_spoiler=spoiler,
                    )
                except DuplicateReviewError:
                    pass

            # Ensure review fields and back-date
            days_ago = (total_reviews % 20) + 1
            rev_dt = now_utc - timedelta(days=days_ago)
            rev_col.update_one(
                {"user_id": user_id, "book_id": book_id},
                {
                    "$set": {
                        "rating": rating,
                        "title": title,
                        "body": body,
                        "contains_spoiler": spoiler,
                        "moderation_status": "APPROVED",
                        "created_at": rev_dt,
                        "updated_at": rev_dt,
                    }
                },
            )
            total_reviews += 1

    print(f"    - Seeded {total_shelves} shelf entries, {total_favorites} favorites, {total_reviews} reviews.")


def seed_carts_and_orders(user_map: dict[str, Any], product_map: dict[str, StoreProduct]):
    """Seed shopping carts and back-dated historical orders (PostgreSQL)."""
    print("  [5/6] Seeding carts and orders (PostgreSQL)...")
    now_utc = datetime.now(timezone.utc)

    # 1. Carts
    total_cart_items = 0
    for username, items in CART_DATA.items():
        user = user_map[username]
        cart, _ = Cart.objects.get_or_create(user=user, defaults={"status": CartStatus.ACTIVE})
        # Clear existing items for deterministic idempotent state
        cart.items.all().delete()
        for item_data in items:
            product = product_map[item_data["book_key"]]
            CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=item_data["quantity"],
            )
            total_cart_items += 1

    # 2. Orders
    total_orders = 0
    for username, orders_list in ORDERS_DATA.items():
        user = user_map[username]
        for o_data in orders_list:
            order_key = o_data["order_key"]
            days_ago = o_data["days_ago"]
            order_dt = now_utc - timedelta(days=days_ago)
            status = o_data["status"]
            payment_status = o_data["payment_status"]
            subtotal = o_data["subtotal"]
            total = o_data["total"]

            # Use order subtotal + user + items match to avoid duplicates on idempotent runs
            first_item_title = o_data["items"][0]["title"]
            existing_order = Order.objects.filter(
                user=user,
                subtotal=subtotal,
                items__title=first_item_title,
            ).first()

            if not existing_order:
                order = Order.objects.create(
                    user=user,
                    status=status,
                    subtotal=subtotal,
                    total=total,
                )
                for item_info in o_data["items"]:
                    product = product_map.get(item_info["book_key"])
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        title=item_info["title"],
                        quantity=item_info["quantity"],
                        price=item_info["price"],
                    )
                Payment.objects.create(
                    order=order,
                    status=payment_status,
                    amount=total,
                )
            else:
                order = existing_order
                order.status = status
                order.subtotal = subtotal
                order.total = total
                order.save()
                if hasattr(order, "payment"):
                    order.payment.status = payment_status
                    order.payment.amount = total
                    order.payment.save()

            # Back-date created_at directly via QuerySet update to bypass auto_now_add
            Order.objects.filter(id=order.id).update(created_at=order_dt, updated_at=order_dt)
            OrderItem.objects.filter(order=order).update(created_at=order_dt)
            Payment.objects.filter(order=order).update(created_at=order_dt, updated_at=order_dt)
            total_orders += 1

    print(f"    - Seeded {total_cart_items} active cart items across demo users.")
    print(f"    - Seeded {total_orders} historical orders (with line items and payments).")


def seed_community(user_map: dict[str, Any], book_map: dict[str, str]):
    """Seed Reading Circle discussions, replies, reports, and moderation audits."""
    print("  [6/6] Seeding community and moderation data (MongoDB)...")
    setup_community_indexes()

    db = get_db()
    now_ts = datetime.now(timezone.utc).timestamp()
    DAY_SECS = 86400.0

    # 1. Discussions
    for d in DISCUSSIONS_DATA:
        author = user_map[d["author_username"]]
        book_id = book_map.get(d["book_key"]) if d["book_key"] else None
        created_at = now_ts - (d["days_ago"] * DAY_SECS)

        doc = {
            "_id": d["id"],
            "book_id": book_id,
            "topic_type": d["topic_type"],
            "author_user_id": str(author.id),
            "title": d["title"],
            "body": d["body"],
            "created_at": created_at,
            "updated_at": created_at,
            "moderation_status": d["moderation_status"],
            "deleted_at": None,
        }
        db.discussions.replace_one({"_id": d["id"]}, doc, upsert=True)

    # 2. Replies
    for r in REPLIES_DATA:
        author = user_map[r["author_username"]]
        created_at = now_ts - (r["days_ago"] * DAY_SECS)

        doc = {
            "_id": r["id"],
            "discussion_id": r["discussion_id"],
            "author_user_id": str(author.id),
            "body": r["body"],
            "created_at": created_at,
            "updated_at": created_at,
            "moderation_status": ModerationStatus.VISIBLE,
            "deleted_at": None,
        }
        db.replies.replace_one({"_id": r["id"]}, doc, upsert=True)

    # 3. Moderation Reports
    for rep in MODERATION_REPORTS_DATA:
        reporter = user_map[rep["reporter_username"]]
        created_at = now_ts - (rep["days_ago"] * DAY_SECS)

        resolved_at = None
        resolved_by_id = None
        if rep["resolved"]:
            resolved_at = now_ts - (rep["resolved_days_ago"] * DAY_SECS)
            resolved_by_id = str(user_map[rep["resolved_by_username"]].id)

        doc = {
            "_id": rep["id"],
            "reporter_user_id": str(reporter.id),
            "target_type": rep["target_type"],
            "target_id": rep["target_id"],
            "reason": rep["reason"],
            "details": rep["details"],
            "status": rep["status"],
            "created_at": created_at,
            "resolved_at": resolved_at,
            "resolved_by_user_id": resolved_by_id,
            "resolution_note": rep.get("resolution_note"),
        }
        db.reports.replace_one({"_id": rep["id"]}, doc, upsert=True)

    # 4. Moderation Audits
    for aud in MODERATION_AUDITS_DATA:
        moderator = user_map[aud["moderator_username"]]
        created_at = now_ts - (aud["days_ago"] * DAY_SECS)

        doc = {
            "_id": aud["id"],
            "moderator_user_id": str(moderator.id),
            "target_type": aud["target_type"],
            "target_id": aud["target_id"],
            "action": aud["action"],
            "note": aud["note"],
            "created_at": created_at,
        }
        db.moderation_audits.replace_one({"_id": aud["id"]}, doc, upsert=True)

    print(f"    - Seeded {len(DISCUSSIONS_DATA)} discussions, {len(REPLIES_DATA)} replies, "
          f"{len(MODERATION_REPORTS_DATA)} reports, {len(MODERATION_AUDITS_DATA)} audit records.")


# ─── 4. Summary Table ──────────────────────────────────────────────────────────

def print_summary_table():
    """Print a clean Markdown summary table of seeded counts across models and collections."""
    db = get_db()
    books_col = get_books_collection()
    lib_col = _get_library_col()
    fav_col = _get_favorites_col()
    rev_col = get_reviews_col()

    total_books = books_col.count_documents({})
    total_products = StoreProduct.objects.count()
    total_disc = db.discussions.count_documents({"deleted_at": None})
    total_replies = db.replies.count_documents({"deleted_at": None})
    total_reports = db.reports.count_documents({})
    total_audits = db.moderation_audits.count_documents({})

    print("\n" + "=" * 80)
    print("AKASHIC LIBRARY DEMO SEED SUMMARY")
    print("=" * 80)
    print(f"{'Username':<20} | {'Role':<15} | {'Shelves':<8} | {'Favs':<6} | {'Reviews':<8} | {'Orders':<6} | {'Cart':<5}")
    print("-" * 80)

    for username in DEMO_USERNAMES:
        user = User.objects.filter(username=username).first()
        if not user:
            continue
        uid = str(user.id)
        shelves_count = lib_col.count_documents({"user_id": uid})
        favs_count = fav_col.count_documents({"user_id": uid})
        revs_count = rev_col.count_documents({"user_id": uid})
        orders_count = Order.objects.filter(user=user).count()
        cart = Cart.objects.filter(user=user).first()
        cart_items_count = cart.items.count() if cart else 0

        print(f"{username:<20} | {user.role:<15} | {shelves_count:<8} | {favs_count:<6} | {revs_count:<8} | {orders_count:<6} | {cart_items_count:<5}")

    print("-" * 80)
    print("COLLECTION & TABLE TOTALS:")
    print(f"  • Total Books (MongoDB):               {total_books}")
    print(f"  • Total Store Products (PostgreSQL):   {total_products}")
    print(f"  • Total Discussions (MongoDB):         {total_disc}")
    print(f"  • Total Replies (MongoDB):             {total_replies}")
    print(f"  • Total Moderation Reports (MongoDB):  {total_reports}")
    print(f"  • Total Moderation Audits (MongoDB):   {total_audits}")
    print("=" * 80)
    print("Demo Password for all demo accounts: Akashic@Demo2026")
    print("=" * 80 + "\n")


# ─── 5. Main CLI Entry Point ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Akashic Library Demo Accounts & Realistic Seed Data Generator."
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Remove ONLY seed-created demo data and exit.",
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Perform a clean reset first, then re-seed all demo data.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Bypass safety guards (non-local hosts or DEBUG=False).",
    )

    args = parser.parse_args()

    # Safety check
    check_safety_guards(force=args.force)

    if args.reset:
        run_reset()
        return

    if args.fresh:
        run_reset()

    print("\n[SEED] Populating Akashic Library demo data...")
    user_map = seed_users()
    book_map = seed_books()
    product_map = seed_store_products(book_map)
    seed_library_and_reviews(user_map, book_map)
    seed_carts_and_orders(user_map, product_map)
    seed_community(user_map, book_map)

    print("\n[SEED] Data seeding completed successfully.")
    print_summary_table()


if __name__ == "__main__":
    main()
