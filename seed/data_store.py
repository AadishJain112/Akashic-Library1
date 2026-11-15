"""
Store products specification for Akashic Bookshop (16 products across all statuses).
"""

from decimal import Decimal
from store.models import StoreStatus

STORE_PRODUCTS_DATA = [
    # ── 8 × IN_STOCK (quantities 6 to 40, available > 5) ──
    {
        "book_key": "book_14",  # Dune
        "edition": "Paperback",
        "condition": "Like New",
        "price": Decimal("18.99"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 25,
        "reserved_quantity": 3,  # available = 22
    },
    {
        "book_key": "book_22",  # Atomic Habits
        "edition": "Hardcover",
        "condition": "New",
        "price": Decimal("24.50"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 30,
        "reserved_quantity": 2,  # available = 28
    },
    {
        "book_key": "book_19",  # Clean Code
        "edition": "Paperback",
        "condition": "Very Good",
        "price": Decimal("34.99"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 15,
        "reserved_quantity": 1,  # available = 14
    },
    {
        "book_key": "book_12",  # The Hobbit
        "edition": "Hardcover",
        "condition": "New",
        "price": Decimal("22.00"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 20,
        "reserved_quantity": 0,  # available = 20
    },
    {
        "book_key": "book_01",  # Pride and Prejudice
        "edition": "Collector's Edition",
        "condition": "New",
        "price": Decimal("29.99"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 12,
        "reserved_quantity": 0,  # available = 12
    },
    {
        "book_key": "book_04",  # 1984
        "edition": "Paperback",
        "condition": "Good",
        "price": Decimal("9.99"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 40,
        "reserved_quantity": 5,  # available = 35
    },
    {
        "book_key": "book_24",  # Sapiens
        "edition": "Paperback",
        "condition": "Like New",
        "price": Decimal("16.50"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 18,
        "reserved_quantity": 0,  # available = 18
    },
    {
        "book_key": "book_20",  # The Pragmatic Programmer
        "edition": "Anniversary Edition",
        "condition": "New",
        "price": Decimal("44.95"),
        "status": StoreStatus.IN_STOCK,
        "quantity": 10,
        "reserved_quantity": 2,  # available = 8
    },

    # ── 3 × LOW_STOCK (available 1 to 4) ──
    {
        "book_key": "book_16",  # Neuromancer
        "edition": "Paperback",
        "condition": "Good",
        "price": Decimal("11.50"),
        "status": StoreStatus.LOW_STOCK,
        "quantity": 4,
        "reserved_quantity": 1,  # available = 3
    },
    {
        "book_key": "book_23",  # Thinking, Fast and Slow
        "edition": "Paperback",
        "condition": "Very Good",
        "price": Decimal("14.99"),
        "status": StoreStatus.LOW_STOCK,
        "quantity": 3,
        "reserved_quantity": 0,  # available = 3
    },
    {
        "book_key": "book_10",  # Crime and Punishment
        "edition": "Hardcover",
        "condition": "Very Good",
        "price": Decimal("19.99"),
        "status": StoreStatus.LOW_STOCK,
        "quantity": 2,
        "reserved_quantity": 0,  # available = 2
    },

    # ── 2 × OUT_OF_STOCK (available 0) ──
    {
        "book_key": "book_21",  # Introduction to Algorithms
        "edition": "Student Edition",
        "condition": "Good",
        "price": Decimal("55.00"),
        "status": StoreStatus.OUT_OF_STOCK,
        "quantity": 2,
        "reserved_quantity": 2,  # available = 0
    },
    {
        "book_key": "book_11",  # Frankenstein
        "edition": "Paperback",
        "condition": "Good",
        "price": Decimal("7.99"),
        "status": StoreStatus.OUT_OF_STOCK,
        "quantity": 0,
        "reserved_quantity": 0,  # available = 0
    },

    # ── 2 × PREORDER ──
    {
        "book_key": "book_26",  # Cosmos
        "edition": "Anniversary Edition",
        "condition": "New",
        "price": Decimal("39.99"),
        "status": StoreStatus.PREORDER,
        "quantity": 0,
        "reserved_quantity": 0,
    },
    {
        "book_key": "book_28",  # The Palace of Illusions
        "edition": "Hardcover",
        "condition": "New",
        "price": Decimal("21.99"),
        "status": StoreStatus.PREORDER,
        "quantity": 50,
        "reserved_quantity": 0,
    },

    # ── 1 × DISCONTINUED (hidden from public catalog) ──
    {
        "book_key": "book_18",  # The Da Vinci Code
        "edition": "Paperback",
        "condition": "Good",
        "price": Decimal("5.99"),
        "status": StoreStatus.DISCONTINUED,
        "quantity": 0,
        "reserved_quantity": 0,
    },
]
