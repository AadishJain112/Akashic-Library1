"""
Library shelves, favorites, and reviews data for demo users.
"""

LIBRARY_DATA = {
    # ── demo_reader (Main showcase account) ──
    "demo_reader": {
        "shelves": [
            # WANT_TO_READ (4)
            {"book_key": "book_02", "status": "WANT_TO_READ"},  # Jane Eyre
            {"book_key": "book_15", "status": "WANT_TO_READ"},  # Foundation
            {"book_key": "book_20", "status": "WANT_TO_READ"},  # The Pragmatic Programmer
            {"book_key": "book_25", "status": "WANT_TO_READ"},  # A Brief History of Time
            # READING (3)
            {"book_key": "book_12", "status": "READING"},       # The Hobbit
            {"book_key": "book_21", "status": "READING"},       # Introduction to Algorithms
            {"book_key": "book_24", "status": "READING"},       # Sapiens
            # READ (7)
            {"book_key": "book_01", "status": "READ"},          # Pride and Prejudice
            {"book_key": "book_04", "status": "READ"},          # 1984
            {"book_key": "book_14", "status": "READ"},          # Dune
            {"book_key": "book_19", "status": "READ"},          # Clean Code
            {"book_key": "book_22", "status": "READ"},          # Atomic Habits
            {"book_key": "book_23", "status": "READ"},          # Thinking, Fast and Slow
            {"book_key": "book_26", "status": "READ"},          # Cosmos
        ],
        "favorites": ["book_01", "book_04", "book_14", "book_19", "book_22"],
        "reviews": [
            {
                "book_key": "book_14",  # Dune
                "rating": 5,
                "title": "A colossal science fiction masterpiece of politics and prophecy",
                "body": (
                    "Frank Herbert's Dune is far more than a space adventure; it is a profound examination of how ecology, "
                    "feudal politics, and religious mythology intertwine to shape civilizations. The world-building on "
                    "Arrakis is staggering in depth, from the water-preservation rituals of the Fremen to the calculated "
                    "schemes of the Bene Gesserit. Paul's journey is not a simple hero's triumph, but an unsettling exploration "
                    "of the burdens of prescience and charismatic leadership. An absolute titan of world literature."
                ),
                "contains_spoiler": False,
            },
            {
                "book_key": "book_01",  # Pride and Prejudice
                "rating": 5,
                "title": "Timeless wit, irony, and indelible character development",
                "body": (
                    "Austen's sparkling dialogue and keen social satire feel as fresh today as when first published. "
                    "Elizabeth Bennet's independent spirit and Mr. Darcy's gradual humility create one of the most rewarding "
                    "courtships in all of English literature."
                ),
                "contains_spoiler": False,
            },
            {
                "book_key": "book_04",  # 1984
                "rating": 4,
                "title": "Chilling, prophetic, and disturbingly modern",
                "body": (
                    "Orwell's depiction of doublethink, memory holes, and state-sanctioned surveillance remains an urgent warning. "
                    "Winston's eventual total submission in Room 101 underscores the terrifying reach of totalitarian psychology."
                ),
                "contains_spoiler": True,
            },
            {
                "book_key": "book_19",  # Clean Code
                "rating": 4,
                "title": "Essential principles for engineering professionalism",
                "body": (
                    "Uncle Bob's emphasis on readability, meaningful variable naming, and SRP fundamentally shifted how I "
                    "structure daily software tasks. While a few dogmas feel slightly rigid, the core philosophy is invaluable."
                ),
                "contains_spoiler": False,
            },
            {
                "book_key": "book_22",  # Atomic Habits
                "rating": 4,
                "title": "Practical compound growth through environmental design",
                "body": (
                    "James Clear demystifies personal change by shifting focus away from sheer willpower towards system design. "
                    "Habit stacking and reducing friction have made a demonstrable impact on my reading consistency."
                ),
                "contains_spoiler": False,
            },
            {
                "book_key": "book_23",  # Thinking, Fast and Slow
                "rating": 3,
                "title": "Brilliant cognitive insights, though somewhat academic and dense",
                "body": (
                    "Kahneman's dichotomy between fast intuitive thinking and slow deliberate reasoning offers profound self-knowledge. "
                    "However, the dense experimental recaps in the middle chapters make for slow, demanding reading."
                ),
                "contains_spoiler": False,
            },
            {
                "book_key": "book_26",  # Cosmos
                "rating": 2,
                "title": "Lyrical prose, but several astronomical sections feel dated",
                "body": (
                    "Carl Sagan's humanist enthusiasm is infectious, but modern readers should be mindful that significant "
                    "cosmological discoveries since the 1980s have superseded several chapters in this volume."
                ),
                "contains_spoiler": True,
            },
        ],
    },

    # ── demo_reader2 (Tech & Science lover) ──
    "demo_reader2": {
        "shelves": [
            {"book_key": "book_19", "status": "READ"},          # Clean Code
            {"book_key": "book_20", "status": "READ"},          # Pragmatic Programmer
            {"book_key": "book_21", "status": "READ"},          # Intro to Algorithms
            {"book_key": "book_14", "status": "READ"},          # Dune
            {"book_key": "book_16", "status": "READ"},          # Neuromancer
            {"book_key": "book_24", "status": "READ"},          # Sapiens
            {"book_key": "book_10", "status": "READ"},          # Crime and Punishment
            {"book_key": "book_12", "status": "READ"},          # The Hobbit
            {"book_key": "book_15", "status": "READING"},       # Foundation
            {"book_key": "book_25", "status": "READING"},       # A Brief History of Time
            {"book_key": "book_04", "status": "WANT_TO_READ"},  # 1984
            {"book_key": "book_26", "status": "WANT_TO_READ"},  # Cosmos
        ],
        "favorites": ["book_19", "book_20", "book_16"],
        "reviews": [
            {
                "book_key": "book_19",
                "rating": 5,
                "title": "The indispensable programmer's handbook",
                "body": "Every software engineer should read this early in their career. The chapters on function signatures and unit tests are gold.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_16",
                "rating": 5,
                "title": "The definitive genesis of cyberpunk aesthetics",
                "body": "Gibson's prose is pure kinetic energy. The neon-drenched atmosphere of the Sprawl and the chilling depiction of Wintermute are legendary.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_14",
                "rating": 4,
                "title": "Intricate world-building and philosophical depth",
                "body": "A magnificent science fiction novel that rewards close reading. The political maneuvers between House Atreides and House Harkonnen are gripping.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_21",
                "rating": 4,
                "title": "The ultimate theoretical algorithmic reference",
                "body": "CLRS is dense and mathematical, but whenever you need an authoritative proof or optimal data structure, nothing compares.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_20",
                "rating": 5,
                "title": "Wisdom on software craftsmanship and career ownership",
                "body": "More than just coding advice, Hunt and Thomas teach professional mindset, debugging philosophy, and pragmatic decision making.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_24",
                "rating": 5,
                "title": "Sweeping, provocative grand history of humankind",
                "body": "Harari's exploration of shared myths as the bedrock of large-scale human cooperation completely changed my perspective on society.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_10",
                "rating": 4,
                "title": "A staggering dive into psychological guilt",
                "body": "Dostoevsky captures the internal torment of Raskolnikov with terrifying precision. The intellectual duels with Porfiry are masterclasses in tension.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_12",
                "rating": 4,
                "title": "Pure high fantasy wonder and adventure",
                "body": "A delightful prelude to Middle-earth. Bilbo's transformation from reluctant homebody to resourceful burglar is heartwarming.",
                "contains_spoiler": False,
            },
        ],
    },

    # ── demo_reader3 (Fantasy, Mystery, Indian Literature) ──
    "demo_reader3": {
        "shelves": [
            {"book_key": "book_12", "status": "READ"},          # The Hobbit
            {"book_key": "book_13", "status": "READ"},          # Harry Potter
            {"book_key": "book_17", "status": "READ"},          # Gone Girl
            {"book_key": "book_27", "status": "READ"},          # The God of Small Things
            {"book_key": "book_28", "status": "READ"},          # The Palace of Illusions
            {"book_key": "book_01", "status": "READ"},          # Pride and Prejudice
            {"book_key": "book_18", "status": "READING"},       # The Da Vinci Code
            {"book_key": "book_02", "status": "WANT_TO_READ"},  # Jane Eyre
            {"book_key": "book_14", "status": "WANT_TO_READ"},  # Dune
        ],
        "favorites": ["book_12", "book_27", "book_28"],
        "reviews": [
            {
                "book_key": "book_12",
                "rating": 5,
                "title": "Unmatched warmth, charm, and timeless adventure",
                "body": "Tolkien's lyrical storytelling makes every chapter a comfort. Riddles in the Dark remains one of my all-time favorite fictional scenes.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_13",
                "rating": 4,
                "title": "A magical beginning to an unforgettable world",
                "body": "Revisiting Hogwarts always brings a surge of nostalgia. The cozy mystery and warmth of friendship make this a joy to read.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_17",
                "rating": 4,
                "title": "A chilling, masterfully plotted psychological duel",
                "body": "Flynn's sharp prose and unreliable narration keep you constantly guessing. The mid-book twist is executed with astonishing cruelty and craft.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_27",
                "rating": 5,
                "title": "Haunting, poetic, and emotionally shattering",
                "body": "Arundhati Roy crafts prose like music. The tragic story of Estha and Rahel in Kerala explores caste, memory, and love laws with profound sensitivity.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_28",
                "rating": 5,
                "title": "A magnificent feminist retelling of the Mahabharata",
                "body": "Divakaruni gives Panchaali a powerful, fiery, and deeply empathetic voice. Seeing the epic conflict unfold through her eyes was breathtaking.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_01",
                "rating": 4,
                "title": "Delightful romantic tension and brilliant societal critique",
                "body": "The dialogue between Elizabeth and Darcy sparkles with wit. A comforting classic that never fails to lift my spirits.",
                "contains_spoiler": False,
            },
        ],
    },

    # ── demo_moderator ──
    "demo_moderator": {
        "shelves": [
            {"book_key": "book_04", "status": "READ"},          # 1984
            {"book_key": "book_07", "status": "READ"},          # To Kill a Mockingbird
            {"book_key": "book_10", "status": "READ"},          # Crime and Punishment
            {"book_key": "book_08", "status": "READING"},       # The Great Gatsby
            {"book_key": "book_09", "status": "WANT_TO_READ"},  # The Catcher in the Rye
        ],
        "favorites": ["book_07", "book_10"],
        "reviews": [
            {
                "book_key": "book_07",
                "rating": 5,
                "title": "Moral courage, empathy, and integrity beautifully told",
                "body": "Atticus Finch's quiet conviction and Scout's innocence provide a moral compass that remains deeply relevant across generations.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_04",
                "rating": 5,
                "title": "A terrifyingly prescient analysis of authoritarian power",
                "body": "Orwell's warning against the erosion of truth and the manipulation of language is essential reading for every citizen of the world.",
                "contains_spoiler": False,
            },
        ],
    },

    # ── demo_storemanager ──
    "demo_storemanager": {
        "shelves": [
            {"book_key": "book_22", "status": "READ"},          # Atomic Habits
            {"book_key": "book_24", "status": "READ"},          # Sapiens
            {"book_key": "book_01", "status": "READ"},          # Pride and Prejudice
            {"book_key": "book_14", "status": "READING"},       # Dune
            {"book_key": "book_05", "status": "WANT_TO_READ"},  # Brave New World
        ],
        "favorites": ["book_22", "book_24"],
        "reviews": [
            {
                "book_key": "book_22",
                "rating": 5,
                "title": "Invaluable practical framework for continuous improvement",
                "body": "The concept of 1% daily improvement applies directly to business and retail management. Clear, actionable, and inspiring.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_24",
                "rating": 4,
                "title": "Fascinating perspective on the origins of commerce and trade",
                "body": "Harari's breakdown of how money functions as a universal system of mutual trust was especially illuminating from a merchant's perspective.",
                "contains_spoiler": False,
            },
        ],
    },

    # ── demo_admin ──
    "demo_admin": {
        "shelves": [
            {"book_key": "book_19", "status": "READ"},          # Clean Code
            {"book_key": "book_24", "status": "READ"},          # Sapiens
            {"book_key": "book_14", "status": "READ"},          # Dune
            {"book_key": "book_16", "status": "READ"},          # Neuromancer
            {"book_key": "book_20", "status": "READING"},       # The Pragmatic Programmer
            {"book_key": "book_22", "status": "WANT_TO_READ"},  # Atomic Habits
        ],
        "favorites": ["book_19", "book_24"],
        "reviews": [
            {
                "book_key": "book_19",
                "rating": 5,
                "title": "The bedrock of sustainable software architecture",
                "body": "High-quality engineering starts with clean functions and self-documenting code. A foundational text for any engineering leader.",
                "contains_spoiler": False,
            },
            {
                "book_key": "book_16",
                "rating": 4,
                "title": "Visionary science fiction that predicted our digital era",
                "body": "Gibson's visualization of data networks and cyberspace established the vocabulary of contemporary computing.",
                "contains_spoiler": False,
            },
        ],
    },
}
