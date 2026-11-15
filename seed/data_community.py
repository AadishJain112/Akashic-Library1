"""
Community discussions, replies, and moderation data specifications.
"""

from community.constants import ModerationStatus, ReportStatus, TargetType, ModerationAction

# Deterministic IDs for idempotent upserts and clean reset
DISCUSSIONS_DATA = [
    {
        "id": "disc_demo_01",
        "author_username": "demo_reader",
        "topic_type": "GENERAL",
        "book_key": "book_01",  # Pride and Prejudice
        "title": "Best classics to start with for modern readers?",
        "body": "I recently revisited Jane Austen and fell in love with her wit. For people trying to build a consistent habit of reading 19th-century classics, which titles would you recommend starting with?",
        "days_ago": 28,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_02",
        "author_username": "demo_reader",
        "topic_type": "BOOK_CLUB",
        "book_key": "book_14",  # Dune
        "title": "Dune Discussion: Is Paul Atreides a hero or a cautionary tale?",
        "body": "Having finished the original novel, Frank Herbert seems to be warning us against charismatic leaders rather than glorifying Paul. How did everyone interpret the climax and the prescience dilemma?",
        "days_ago": 25,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_03",
        "author_username": "demo_reader",
        "topic_type": "QUESTIONS",
        "book_key": "book_19",  # Clean Code
        "title": "Is Clean Code still relevant in 2026?",
        "body": "Some of Uncle Bob's guidelines like tiny functions and extreme refactoring spark endless debates. What parts of Clean Code do you find timeless versus dated in modern language ecosystems?",
        "days_ago": 22,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_04",
        "author_username": "demo_reader2",
        "topic_type": "RECOMMENDATIONS",
        "book_key": "book_16",  # Neuromancer
        "title": "Looking for gritty cyberpunk following Gibson's aesthetic",
        "body": "Just finished Neuromancer. The atmosphere was incredible. What should I read next if I want similar dense, tech-noir aesthetics and speculative concepts?",
        "days_ago": 20,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_05",
        "author_username": "demo_reader2",
        "topic_type": "GENERAL",
        "book_key": None,
        "title": "How do you manage your technical reading notes?",
        "body": "I often struggle to retain dense engineering textbooks. Do you use Obsidian, physical notebooks, or build practical side projects while working through a chapter?",
        "days_ago": 18,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_06",
        "author_username": "demo_reader3",
        "topic_type": "BOOK_CLUB",
        "book_key": "book_27",  # The God of Small Things
        "title": "The non-linear storytelling in The God of Small Things",
        "body": "Arundhati Roy's language is pure poetry, but the shifting timelines require undivided attention. Let's discuss your favorite metaphors and recurring motifs from the novel.",
        "days_ago": 15,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_07",
        "author_username": "demo_reader3",
        "topic_type": "RECOMMENDATIONS",
        "book_key": "book_28",  # The Palace of Illusions
        "title": "Mythological retellings from female perspectives",
        "body": "Draupadi's voice in Palace of Illusions was mesmerizing. Are there other mythological retellings written from female perspectives that you would recommend?",
        "days_ago": 12,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_08",
        "author_username": "demo_moderator",
        "topic_type": "NEWS",
        "book_key": None,
        "title": "Welcome to the Reading Circle — Guidelines and Community Ethos",
        "body": "Welcome to all new members of Akashic Library! Please remember to keep discussions respectful, flag spoilers appropriately, and enjoy exchanging literary thoughts.",
        "days_ago": 10,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_09",
        "author_username": "demo_admin",
        "topic_type": "QUESTIONS",
        "book_key": None,
        "title": "Physical editions versus digital reading: What is your split?",
        "body": "As someone who cherishes paper bindings but travels frequently, I find myself torn between my physical bookshelf and an e-reader. What is your reading workflow?",
        "days_ago": 8,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_10",
        "author_username": "demo_reader",
        "topic_type": "RECOMMENDATIONS",
        "book_key": "book_22",  # Atomic Habits
        "title": "Habit stacking: What small reading routines work for you?",
        "body": "James Clear talks about anchoring new habits to existing ones. I started reading 10 pages immediately after my morning coffee. What routines work best for you?",
        "days_ago": 6,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_11",
        "author_username": "demo_reader2",
        "topic_type": "GENERAL",
        "book_key": "book_24",  # Sapiens
        "title": "The Agricultural Revolution: Progress or trap?",
        "body": "Harari's argument that wheat domesticated humans rather than the reverse was thought-provoking. What was your main takeaway from Sapiens?",
        "days_ago": 4,
        "moderation_status": ModerationStatus.VISIBLE,
    },
    {
        "id": "disc_demo_12",
        "author_username": "demo_reader3",
        "topic_type": "GENERAL",
        "book_key": None,
        "title": "Free cheap eBooks download link click here now!",
        "body": "Get free pirated books at suspicious-domain-example.com/download right now! Best deals daily!",
        "days_ago": 2,
        "moderation_status": ModerationStatus.HIDDEN,  # Hidden for moderation demonstration
    },
]

REPLIES_DATA = [
    # ── On disc_demo_01 ──
    {
        "id": "reply_demo_01",
        "discussion_id": "disc_demo_01",
        "author_username": "demo_reader2",
        "body": "Pride and Prejudice is definitely the most accessible. The dialogue is so quick and funny that you forget it was written two centuries ago.",
        "days_ago": 27.5,
    },
    {
        "id": "reply_demo_02",
        "discussion_id": "disc_demo_01",
        "author_username": "demo_reader3",
        "body": "Jane Eyre was my gateway into classics. The gothic atmosphere and Jane's moral clarity pull you right in from page one.",
        "days_ago": 27.0,
    },
    {
        "id": "reply_demo_03",
        "discussion_id": "disc_demo_01",
        "author_username": "demo_moderator",
        "body": "To Kill a Mockingbird is another fantastic starting point. Direct, powerful, and deeply moving without being obtuse.",
        "days_ago": 26.5,
    },
    {
        "id": "reply_demo_04",
        "discussion_id": "disc_demo_01",
        "author_username": "demo_reader",
        "body": "Thank you all! Austen's humor and pacing definitely made it a joy to read.",
        "days_ago": 26.0,
    },

    # ── On disc_demo_02 ──
    {
        "id": "reply_demo_05",
        "discussion_id": "disc_demo_02",
        "author_username": "demo_reader2",
        "body": "Herbert explicitly stated in interviews that Paul is not a traditional superhero. Dune Messiah doubles down on that theme ruthlessly.",
        "days_ago": 24.5,
    },
    {
        "id": "reply_demo_06",
        "discussion_id": "disc_demo_02",
        "author_username": "demo_admin",
        "body": "The tragic inevitability of the Jihad is what makes the ending so poignant. Paul knew what was coming and was powerless to halt it.",
        "days_ago": 24.0,
    },
    {
        "id": "reply_demo_07",
        "discussion_id": "disc_demo_02",
        "author_username": "demo_reader",
        "body": "Exactly. The tragedy is that Paul's vengeance traps him inside a religious movement bigger than himself.",
        "days_ago": 23.5,
    },
    {
        "id": "reply_demo_08",
        "discussion_id": "disc_demo_02",
        "author_username": "demo_reader3",
        "body": "The political maneuvers of the Bene Gesserit were fascinating to trace throughout the entire journey.",
        "days_ago": 23.0,
    },

    # ── On disc_demo_03 ──
    {
        "id": "reply_demo_09",
        "discussion_id": "disc_demo_03",
        "author_username": "demo_reader2",
        "body": "Meaningful naming, small coherent units, and pure functions will never go out of style, regardless of the tech stack.",
        "days_ago": 21.5,
    },
    {
        "id": "reply_demo_10",
        "discussion_id": "disc_demo_03",
        "author_username": "demo_admin",
        "body": "Agreed. Some of the micro-function dogmas are overkill, but the core ethos of clarity and empathy for the next maintainer is immortal.",
        "days_ago": 21.0,
    },
    {
        "id": "reply_demo_11",
        "discussion_id": "disc_demo_03",
        "author_username": "demo_reader",
        "body": "That is my takeaway as well. Code should read like well-crafted prose.",
        "days_ago": 20.5,
    },

    # ── On disc_demo_04 ──
    {
        "id": "reply_demo_12",
        "discussion_id": "disc_demo_04",
        "author_username": "demo_admin",
        "body": "Snow Crash by Neal Stephenson is a natural follow-up, though it approaches the genre with a sharper satirical edge.",
        "days_ago": 19.5,
    },
    {
        "id": "reply_demo_13",
        "discussion_id": "disc_demo_04",
        "author_username": "demo_reader3",
        "body": "Do Androids Dream of Electric Sheep? by Philip K. Dick captures that melancholy, decaying technological world perfectly.",
        "days_ago": 19.0,
    },
    {
        "id": "reply_demo_14",
        "discussion_id": "disc_demo_04",
        "author_username": "demo_reader",
        "body": "Also check out Altered Carbon by Richard K. Morgan if you want hardboiled detective mystery blended with transhumanist sci-fi.",
        "days_ago": 18.5,
    },

    # ── On disc_demo_05 ──
    {
        "id": "reply_demo_15",
        "discussion_id": "disc_demo_05",
        "author_username": "demo_reader",
        "body": "I write mini prototype projects for each chapter. Applying the concepts in actual code cements them far better than passive reading.",
        "days_ago": 17.5,
    },
    {
        "id": "reply_demo_16",
        "discussion_id": "disc_demo_05",
        "author_username": "demo_admin",
        "body": "Markdown notes synced to a personal knowledge repo with code snippets works best for our engineering workflow.",
        "days_ago": 17.0,
    },

    # ── On disc_demo_06 ──
    {
        "id": "reply_demo_17",
        "discussion_id": "disc_demo_06",
        "author_username": "demo_reader",
        "body": "The recurring motif 'Things can change in a day' echoes through the entire structure of the novel. Heartbreakingly beautiful.",
        "days_ago": 14.5,
    },
    {
        "id": "reply_demo_18",
        "discussion_id": "disc_demo_06",
        "author_username": "demo_moderator",
        "body": "Roy's sensory descriptions of Ayemenem and the river stay with you long after the final page.",
        "days_ago": 14.0,
    },

    # ── On disc_demo_07 ──
    {
        "id": "reply_demo_19",
        "discussion_id": "disc_demo_07",
        "author_username": "demo_reader",
        "body": "Circe by Madeline Miller has a very similar emotional resonance and powerful mythological voice.",
        "days_ago": 11.5,
    },
    {
        "id": "reply_demo_20",
        "discussion_id": "disc_demo_07",
        "author_username": "demo_reader2",
        "body": "The Silence of the Girls by Pat Barker explores the Trojan War through Briseis' eyes with equal raw intensity.",
        "days_ago": 11.0,
    },

    # ── On disc_demo_08 ──
    {
        "id": "reply_demo_21",
        "discussion_id": "disc_demo_08",
        "author_username": "demo_reader",
        "body": "Excited to be part of the Akashic community! Looking forward to great book recommendations and thoughtful discussions.",
        "days_ago": 9.5,
    },
    {
        "id": "reply_demo_22",
        "discussion_id": "disc_demo_08",
        "author_username": "demo_reader2",
        "body": "Great to have clear guidelines. Happy reading everyone!",
        "days_ago": 9.0,
    },
    {
        "id": "reply_demo_23",
        "discussion_id": "disc_demo_08",
        "author_username": "demo_reader3",
        "body": "Thanks Maya! Looking forward to sharing book reviews here.",
        "days_ago": 8.5,
    },

    # ── On disc_demo_09 ──
    {
        "id": "reply_demo_24",
        "discussion_id": "disc_demo_09",
        "author_username": "demo_storemanager",
        "body": "Nothing beats the physical weight, texture, and typography of a well-bound hardcover in the evening.",
        "days_ago": 7.5,
    },
    {
        "id": "reply_demo_25",
        "discussion_id": "disc_demo_09",
        "author_username": "demo_reader",
        "body": "E-reader for daily transit and commutes, hardcovers for home reading and study.",
        "days_ago": 7.0,
    },

    # ── On disc_demo_10 ──
    {
        "id": "reply_demo_26",
        "discussion_id": "disc_demo_10",
        "author_username": "demo_storemanager",
        "body": "15 minutes of reading right before opening the bookshop works wonders for keeping mental focus.",
        "days_ago": 5.5,
    },
    {
        "id": "reply_demo_27",
        "discussion_id": "disc_demo_10",
        "author_username": "demo_reader3",
        "body": "Reading right before bed instead of checking notifications transformed my sleep schedule.",
        "days_ago": 5.0,
    },

    # ── On disc_demo_11 ──
    {
        "id": "reply_demo_28",
        "discussion_id": "disc_demo_11",
        "author_username": "demo_reader",
        "body": "The luxury trap concept really resonated with modern consumerism and digital culture.",
        "days_ago": 3.5,
    },
    {
        "id": "reply_demo_29",
        "discussion_id": "disc_demo_11",
        "author_username": "demo_reader3",
        "body": "The idea of shared imagined realities was the biggest eye-opener for me.",
        "days_ago": 3.0,
    },

    # ── On disc_demo_12 (Spam topic reply to demonstrate reports) ──
    {
        "id": "reply_demo_30",
        "discussion_id": "disc_demo_12",
        "author_username": "demo_reader2",
        "body": "Warning: Please do not click any unverified links posted in this thread. This has been flagged.",
        "days_ago": 1.5,
    },
]

MODERATION_REPORTS_DATA = [
    # 2 PENDING reports (one on discussion, one on reply)
    {
        "id": "report_demo_01",
        "reporter_username": "demo_reader",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_12",
        "reason": "Spam",
        "details": "Spam thread promoting malicious pirated download links.",
        "status": ReportStatus.PENDING,
        "days_ago": 2.0,
        "resolved": False,
    },
    {
        "id": "report_demo_02",
        "reporter_username": "demo_reader2",
        "target_type": TargetType.REPLY,
        "target_id": "reply_demo_30",
        "reason": "Spoilers",
        "details": "User flagged this comment during discussion moderation review.",
        "status": ReportStatus.PENDING,
        "days_ago": 1.5,
        "resolved": False,
    },

    # 1 RESOLVED report
    {
        "id": "report_demo_03",
        "reporter_username": "demo_reader3",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_03",
        "reason": "Off-topic",
        "details": "Belongs in a software engineering forum rather than the general reading circle.",
        "status": ReportStatus.RESOLVED,
        "days_ago": 21.0,
        "resolved": True,
        "resolved_by_username": "demo_moderator",
        "resolved_days_ago": 20.0,
        "resolution_note": "Content reviewed. Software engineering discussions are permitted in the Reading Circle.",
    },

    # 1 DISMISSED report
    {
        "id": "report_demo_04",
        "reporter_username": "demo_reader",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_02",
        "reason": "Harassment",
        "details": "Literary debate regarding Dune characters seemed somewhat heated.",
        "status": ReportStatus.DISMISSED,
        "days_ago": 24.0,
        "resolved": True,
        "resolved_by_username": "demo_moderator",
        "resolved_days_ago": 23.0,
        "resolution_note": "Civil literary debate; no personal attacks detected.",
    },
]

MODERATION_AUDITS_DATA = [
    {
        "id": "audit_demo_01",
        "moderator_username": "demo_moderator",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_12",
        "action": ModerationAction.HIDE,
        "note": "Hidden due to prohibited spam links.",
        "days_ago": 1.8,
    },
    {
        "id": "audit_demo_02",
        "moderator_username": "demo_moderator",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_03",
        "action": ModerationAction.RESOLVE_REPORT,
        "note": "Report resolved; discussion verified as compliant.",
        "days_ago": 20.0,
    },
    {
        "id": "audit_demo_03",
        "moderator_username": "demo_moderator",
        "target_type": TargetType.DISCUSSION,
        "target_id": "disc_demo_02",
        "action": ModerationAction.DISMISS_REPORT,
        "note": "Report dismissed as no harassment found.",
        "days_ago": 23.0,
    },
]
