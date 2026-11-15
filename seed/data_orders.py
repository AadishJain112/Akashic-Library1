"""
Cart and Order specifications for demo accounts.
"""

from decimal import Decimal
from orders.models import OrderStatus, PaymentStatus

CART_DATA = {
    "demo_reader": [
        {"book_key": "book_14", "quantity": 1},  # Dune (Paperback, $18.99)
        {"book_key": "book_22", "quantity": 2},  # Atomic Habits (Hardcover, $24.50 ea)
    ],
    "demo_storemanager": [
        {"book_key": "book_01", "quantity": 1},  # Pride and Prejudice ($29.99)
    ],
    "demo_admin": [
        {"book_key": "book_24", "quantity": 1},  # Sapiens ($16.50)
    ],
}

ORDERS_DATA = {
    "demo_reader": [
        {
            "order_key": "demo_reader_order_1",
            "days_ago": 65,
            "status": OrderStatus.CONFIRMED,
            "payment_status": PaymentStatus.PAID,
            "items": [
                {
                    "book_key": "book_19",  # Clean Code
                    "title": "Clean Code",
                    "quantity": 1,
                    "price": Decimal("34.99"),
                },
                {
                    "book_key": "book_14",  # Dune
                    "title": "Dune",
                    "quantity": 1,
                    "price": Decimal("18.99"),
                },
            ],
            "subtotal": Decimal("53.98"),
            "total": Decimal("53.98"),
        },
        {
            "order_key": "demo_reader_order_2",
            "days_ago": 32,
            "status": OrderStatus.PENDING,
            "payment_status": PaymentStatus.PENDING,
            "items": [
                {
                    "book_key": "book_22",  # Atomic Habits
                    "title": "Atomic Habits",
                    "quantity": 1,
                    "price": Decimal("24.50"),
                },
            ],
            "subtotal": Decimal("24.50"),
            "total": Decimal("24.50"),
        },
        {
            "order_key": "demo_reader_order_3",
            "days_ago": 12,
            "status": OrderStatus.CANCELLED,
            "payment_status": PaymentStatus.FAILED,
            "items": [
                {
                    "book_key": "book_12",  # The Hobbit
                    "title": "The Hobbit",
                    "quantity": 1,
                    "price": Decimal("22.00"),
                },
            ],
            "subtotal": Decimal("22.00"),
            "total": Decimal("22.00"),
        },
    ],
    "demo_storemanager": [
        {
            "order_key": "demo_storemanager_order_1",
            "days_ago": 45,
            "status": OrderStatus.CONFIRMED,
            "payment_status": PaymentStatus.PAID,
            "items": [
                {
                    "book_key": "book_22",  # Atomic Habits
                    "title": "Atomic Habits",
                    "quantity": 2,
                    "price": Decimal("24.50"),
                },
            ],
            "subtotal": Decimal("49.00"),
            "total": Decimal("49.00"),
        },
    ],
}
