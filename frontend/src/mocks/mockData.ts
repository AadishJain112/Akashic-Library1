/**
 * Seeded mock database for Akashic Library
 * Conforms strictly to section 3 & 12 of the prompt.
 */

export interface MockUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'STORE_MANAGER' | 'ADMIN';
  display_name: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const SEEDED_USERS: Record<string, MockUser> = {
  reader: {
    id: 'u-1001-reader',
    username: 'reader',
    email: 'reader@akashic.org',
    role: 'USER',
    display_name: 'Elena Rostova',
    bio: 'Avid explorer of magical realism and labyrinthine architecture.',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  warden: {
    id: 'u-2002-warden',
    username: 'warden',
    email: 'warden@akashic.org',
    role: 'MODERATOR',
    display_name: 'Keeper Vane',
    bio: 'Night watch order guardian. Protecting archival sanctity.',
    created_at: '2024-06-10T14:30:00Z',
    updated_at: '2024-06-10T14:30:00Z',
  },
  manager: {
    id: 'u-3003-manager',
    username: 'manager',
    email: 'manager@akashic.org',
    role: 'STORE_MANAGER',
    display_name: 'Barnaby Finch',
    bio: 'Rare book conservator and physical print acquisitions curator.',
    created_at: '2024-08-20T09:15:00Z',
    updated_at: '2024-08-20T09:15:00Z',
  },
  admin: {
    id: 'u-4004-admin',
    username: 'admin',
    email: 'admin@akashic.org',
    role: 'ADMIN',
    display_name: 'Chief Librarian Althea',
    bio: 'High Keeper of the Akashic Records and Supreme Archivist.',
    created_at: '2023-11-01T00:00:00Z',
    updated_at: '2023-11-01T00:00:00Z',
  },
};

export interface MockBook {
  id: string;
  title: string;
  authors: string[];
  description: string;
  identifiers: { isbn10: string; isbn13: string };
  publication: { publisher: string; published_date: string; language: string; page_count: number };
  subjects: string[];
  covers: string[];
  community: { average_rating: number | null; rating_count: number; distribution: Record<string, number> };
  store: { available: boolean; product_id: string | null };
  in_store: boolean;
}

export const MOCK_BOOKS: MockBook[] = [
  {
    id: 'book-01',
    title: 'The Library of Babel',
    authors: ['Jorge Luis Borges'],
    description: 'An infinite hexagonal universe of galleries containing all possible books of 410 pages.',
    identifiers: { isbn10: '0140286802', isbn13: '9780140286809' },
    publication: { publisher: 'Sur', published_date: '1941', language: 'es', page_count: 36 },
    subjects: ['Fiction', 'Labyrinths', 'Infinity', 'Philosophy'],
    covers: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.9, rating_count: 142, distribution: { '1': 1, '2': 3, '3': 8, '4': 30, '5': 100 } },
    store: { available: true, product_id: 'prod-01' },
    in_store: true,
  },
  {
    id: 'book-02',
    title: 'Invisible Cities',
    authors: ['Italo Calvino'],
    description: 'Marco Polo conjures poetic descriptions of fifty-five cities to the aging Kublai Khan.',
    identifiers: { isbn10: '0156453800', isbn13: '9780156453806' },
    publication: { publisher: 'Einaudi', published_date: '1972', language: 'it', page_count: 165 },
    subjects: ['Magical Realism', 'Architecture', 'Urban Fantasy'],
    covers: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.8, rating_count: 98, distribution: { '1': 0, '2': 2, '3': 6, '4': 25, '5': 65 } },
    store: { available: true, product_id: 'prod-02' },
    in_store: true,
  },
  {
    id: 'book-03',
    title: 'The Name of the Rose',
    authors: ['Umberto Eco'],
    description: 'A Franciscan friar investigates a series of murders in a mysterious medieval Benedictine monastery with a labyrinthine library.',
    identifiers: { isbn10: '0151446474', isbn13: '9780151446476' },
    publication: { publisher: 'Bompiani', published_date: '1980', language: 'it', page_count: 512 },
    subjects: ['Historical Mystery', 'Semiotics', 'Medieval Monasticism'],
    covers: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.7, rating_count: 180, distribution: { '1': 4, '2': 6, '3': 20, '4': 50, '5': 100 } },
    store: { available: true, product_id: 'prod-03' },
    in_store: true,
  },
  {
    id: 'book-04',
    title: 'The Left Hand of Darkness',
    authors: ['Ursula K. Le Guin'],
    description: 'A human envoy is sent to the icy world of Gethen to convince its ambisexual people to join a galactic alliance.',
    identifiers: { isbn10: '0441478123', isbn13: '9780441478125' },
    publication: { publisher: 'Ace Books', published_date: '1969', language: 'en', page_count: 304 },
    subjects: ['Science Fiction', 'Speculative Fiction', 'Anthropology'],
    covers: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.8, rating_count: 87, distribution: { '1': 1, '2': 2, '3': 9, '4': 25, '5': 50 } },
    store: { available: false, product_id: null },
    in_store: false,
  },
  {
    id: 'book-05',
    title: 'Ficciones',
    authors: ['Jorge Luis Borges'],
    description: 'Celebrated collection of philosophical labyrinths, infinite encyclopedias, and imaginary writers.',
    identifiers: { isbn10: '0802130305', isbn13: '9780802130303' },
    publication: { publisher: 'Grove Press', published_date: '1962', language: 'es', page_count: 174 },
    subjects: ['Short Stories', 'Metaphysics', 'Paradox'],
    covers: [null as any], // Procedural cover demonstration
    community: { average_rating: 4.9, rating_count: 130, distribution: { '1': 0, '2': 1, '3': 5, '4': 24, '5': 100 } },
    store: { available: true, product_id: 'prod-04' },
    in_store: true,
  },
  {
    id: 'book-06',
    title: 'Cosmicomics',
    authors: ['Italo Calvino'],
    description: 'Whimsical evolutionary cosmologies narrated by the unpronounceable Qfwfq through the history of the universe.',
    identifiers: { isbn10: '0156226006', isbn13: '9780156226004' },
    publication: { publisher: 'Harcourt', published_date: '1965', language: 'it', page_count: 153 },
    subjects: ['Speculative Fiction', 'Astrophysics', 'Humour'],
    covers: ['https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.6, rating_count: 45, distribution: { '1': 1, '2': 2, '3': 7, '4': 15, '5': 20 } },
    store: { available: true, product_id: 'prod-05' },
    in_store: true,
  },
  {
    id: 'book-07',
    title: 'Orlando: A Biography',
    authors: ['Virginia Woolf'],
    description: 'A poet who changes sex from man to woman and lives for centuries through English literary history.',
    identifiers: { isbn10: '015670160X', isbn13: '9780156701600' },
    publication: { publisher: 'Hogarth Press', published_date: '1928', language: 'en', page_count: 328 },
    subjects: ['Modernism', 'Biography', 'Feminism'],
    covers: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80'],
    community: { average_rating: 4.5, rating_count: 62, distribution: { '1': 2, '2': 4, '3': 10, '4': 20, '5': 26 } },
    store: { available: false, product_id: null },
    in_store: false,
  },
  {
    id: 'book-08',
    title: 'The Book of Disquiet',
    authors: ['Fernando Pessoa'],
    description: 'Posthumous masterpiece composed of prose fragments exploring solitude, dreams, and existential beauty in Lisbon.',
    identifiers: { isbn10: '0141183047', isbn13: '9780141183046' },
    publication: { publisher: 'Penguin Classics', published_date: '1982', language: 'pt', page_count: 544 },
    subjects: ['Philosophy', 'Poetry', 'Lisbon'],
    covers: [null as any], // Procedural cover demonstration
    community: { average_rating: 4.9, rating_count: 110, distribution: { '1': 1, '2': 2, '3': 4, '4': 18, '5': 85 } },
    store: { available: true, product_id: 'prod-06' },
    in_store: true,
  },
];

export type MockProductStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'PREORDER';

export interface MockStoreProduct {
  id: string;
  book_reference: string;
  edition: string;
  condition: string;
  price: number;
  status: MockProductStatus;
  created_at: string;
  updated_at: string;
  inventory: { quantity: number; reserved_quantity: number; available_quantity: number };
}

export const MOCK_STORE_PRODUCTS: MockStoreProduct[] = [
  {
    id: 'prod-01',
    book_reference: 'book-01',
    edition: 'First Folio Illustrated Edition',
    condition: 'Pristine / Fine',
    price: 1250.0,
    status: 'IN_STOCK' as const,
    created_at: '2025-01-10T12:00:00Z',
    updated_at: '2025-01-10T12:00:00Z',
    inventory: { quantity: 15, reserved_quantity: 2, available_quantity: 13 },
  },
  {
    id: 'prod-02',
    book_reference: 'book-02',
    edition: 'Clothbound Hardcover with Ribbons',
    condition: 'Like New',
    price: 890.0,
    status: 'LOW_STOCK' as const,
    created_at: '2025-01-12T12:00:00Z',
    updated_at: '2025-01-12T12:00:00Z',
    inventory: { quantity: 4, reserved_quantity: 1, available_quantity: 3 },
  },
  {
    id: 'prod-03',
    book_reference: 'book-03',
    edition: 'Monastic Illuminated Edition',
    condition: 'Fine',
    price: 1650.0,
    status: 'IN_STOCK' as const,
    created_at: '2025-01-14T12:00:00Z',
    updated_at: '2025-01-14T12:00:00Z',
    inventory: { quantity: 20, reserved_quantity: 0, available_quantity: 20 },
  },
  {
    id: 'prod-04',
    book_reference: 'book-05',
    edition: 'Gilded Leather Collector Print',
    condition: 'New',
    price: 2100.0,
    status: 'PREORDER' as const,
    created_at: '2025-01-15T12:00:00Z',
    updated_at: '2025-01-15T12:00:00Z',
    inventory: { quantity: 25, reserved_quantity: 5, available_quantity: 20 },
  },
  {
    id: 'prod-05',
    book_reference: 'book-06',
    edition: 'Hardcover Trade Print',
    condition: 'Good / Antiquarian',
    price: 650.0,
    status: 'OUT_OF_STOCK' as const,
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-08T12:00:00Z',
    inventory: { quantity: 0, reserved_quantity: 0, available_quantity: 0 },
  },
  {
    id: 'prod-06',
    book_reference: 'book-08',
    edition: 'Portuguese Archival Facsimile',
    condition: 'Mint / Sealed',
    price: 1450.0,
    status: 'IN_STOCK' as const,
    created_at: '2025-01-18T12:00:00Z',
    updated_at: '2025-01-18T12:00:00Z',
    inventory: { quantity: 8, reserved_quantity: 1, available_quantity: 7 },
  },
];
