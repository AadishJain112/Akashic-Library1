"""
Demo Accounts specification for Akashic Library.
"""

from accounts.models import UserRole

DEMO_PASSWORD = "Akashic@Demo2026"
DEMO_EMAIL_DOMAIN = "@example.com"

USERS_DATA = [
    {
        "username": "demo_admin",
        "email": "demo_admin@example.com",
        "role": UserRole.ADMIN,
        "display_name": "Ada Admin",
        "bio": "Akashic system administrator and digital curator. Keeping the archives secure, accessible, and flourishing.",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "username": "demo_moderator",
        "email": "demo_moderator@example.com",
        "role": UserRole.MODERATOR,
        "display_name": "Maya Moderator",
        "bio": "Guardian of the Reading Circle. Passionate about civil discourse, constructive criticism, and great reads.",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "username": "demo_storemanager",
        "email": "demo_storemanager@example.com",
        "role": UserRole.STORE_MANAGER,
        "display_name": "Sam Stockwell",
        "bio": "Keeper of the Akashic Bookshop. Collector of rare editions, fine bindings, and exceptional paper stock.",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "username": "demo_reader",
        "email": "demo_reader@example.com",
        "role": UserRole.USER,
        "display_name": "Riya Reader",
        "bio": "Avid reader exploring science fiction, 19th-century classics, and cognitive psychology. Never seen without a book.",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "username": "demo_reader2",
        "email": "demo_reader2@example.com",
        "role": UserRole.USER,
        "display_name": "Arjun Bookworm",
        "bio": "Software engineer by day, bibliophile by night. Lover of algorithms, distributed systems, and classic sci-fi.",
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "username": "demo_reader3",
        "email": "demo_reader3@example.com",
        "role": UserRole.USER,
        "display_name": "Neha Pageturner",
        "bio": "Devotee of epic fantasy, twisty psychological thrillers, and contemporary Indian literature.",
        "is_staff": False,
        "is_superuser": False,
    },
]

DEMO_USERNAMES = [u["username"] for u in USERS_DATA]
