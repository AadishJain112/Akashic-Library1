import { http, HttpResponse } from 'msw';
import {
  SEEDED_USERS,
  MOCK_BOOKS,
  MOCK_STORE_PRODUCTS,
  MockUser,
} from './mockData';

// In-memory state for mock sessions
let currentUser: MockUser | null = SEEDED_USERS.reader; // default to reader for demo ease
let libraryEntries: any[] = [
  {
    id: 'lib-01',
    book_id: 'book-01',
    status: 'READING',
    favorited: true,
    created_at: '2025-01-10T12:00:00Z',
    updated_at: '2025-01-10T12:00:00Z',
    book: {
      id: 'book-01',
      title: 'The Library of Babel',
      authors: ['Jorge Luis Borges'],
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'lib-02',
    book_id: 'book-02',
    status: 'WANT_TO_READ',
    favorited: false,
    created_at: '2025-01-12T12:00:00Z',
    updated_at: '2025-01-12T12:00:00Z',
    book: {
      id: 'book-02',
      title: 'Invisible Cities',
      authors: ['Italo Calvino'],
      cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'lib-03',
    book_id: 'book-03',
    status: 'READ',
    favorited: true,
    created_at: '2025-01-05T12:00:00Z',
    updated_at: '2025-01-05T12:00:00Z',
    book: {
      id: 'book-03',
      title: 'The Name of the Rose',
      authors: ['Umberto Eco'],
      cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    },
  },
];

let cartItems: any[] = [
  {
    id: 'cart-item-01',
    product_id: 'prod-01',
    book_reference: 'book-01',
    edition: 'First Folio Illustrated Edition',
    condition: 'Pristine / Fine',
    current_price: 1250.0,
    quantity: 1,
    available_quantity: 13,
    line_subtotal: 1250.0,
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
];

let orders: any[] = [
  {
    id: 'ord-9011-babel',
    status: 'CONFIRMED',
    payment_status: 'PAID',
    subtotal: '890.00',
    total: '890.00',
    items: [
      {
        id: 'ord-item-01',
        product_id: 'prod-02',
        title: 'Invisible Cities (Clothbound Hardcover)',
        quantity: 1,
        price: '890.00',
        line_total: '890.00',
      },
    ],
    created_at: '2025-01-14T15:20:00Z',
  },
];

let discussions: any[] = [
  {
    id: 'disc-01',
    book_id: 'book-01',
    topic_type: 'GENERAL',
    author_user_id: 'u-1001-reader',
    title: 'The Infinite Hexagons and the Impossibility of Cataloguing',
    body: 'Borges suggests that if an encyclopedia contains all permutations, then truth is mathematically buried in noise. How does this mirror digital search algorithms today?',
    created_at: Date.now() / 1000 - 86400 * 2,
    updated_at: Date.now() / 1000 - 86400 * 2,
    moderation_status: 'VISIBLE',
  },
  {
    id: 'disc-02',
    book_id: 'book-02',
    topic_type: 'BOOK CLUB',
    author_user_id: 'u-3003-manager',
    title: 'Cities & Memory: Maurilia through Postcards',
    body: 'In Chapter 2, Marco Polo contrasts Maurilia’s modern metropolis with old sepia postcards. Is nostalgia an architectural trap or a preservation mechanism?',
    created_at: Date.now() / 1000 - 86400 * 5,
    updated_at: Date.now() / 1000 - 86400 * 5,
    moderation_status: 'VISIBLE',
  },
];

let replies: any[] = [
  {
    id: 'rep-01',
    discussion_id: 'disc-01',
    author_user_id: 'u-2002-warden',
    body: 'A resonant reflection. Without curated cataloging, the library ceases to be an archive and becomes a desert.',
    created_at: Date.now() / 1000 - 86400,
    updated_at: Date.now() / 1000 - 86400,
    moderation_status: 'VISIBLE',
  },
];

let reports: any[] = [
  {
    id: 'rep-99',
    reporter_user_id: 'u-1001-reader',
    target_type: 'DISCUSSION',
    target_id: 'disc-02',
    reason: 'Off-topic discussion in scholarly chapter review',
    details: 'The post deviates into non-canonical speculation.',
    status: 'PENDING',
    created_at: Date.now() / 1000 - 3600 * 4,
    resolved_at: null,
    resolved_by_user_id: null,
    resolution_note: null,
  },
];

let reviews: any[] = [
  {
    id: 'rev-01',
    book_id: 'book-01',
    user_id: 'u-1001-reader',
    rating: 5,
    title: 'A cornerstone of architectural metaphysics',
    body: 'Every time I reread this short piece, another hallway appears in my thoughts. Borges crafts infinite dread and infinite wonder with equal precision.',
    contains_spoiler: false,
    helpful_count: 34,
    moderation_status: 'APPROVED',
    created_at: '2025-01-11T14:00:00Z',
    updated_at: '2025-01-11T14:00:00Z',
    author: {
      id: 'u-1001-reader',
      username: 'reader',
      display_name: 'Elena Rostova',
    },
  },
  {
    id: 'rev-02',
    book_id: 'book-01',
    user_id: 'u-2002-warden',
    rating: 5,
    title: 'Beware the Purifiers in the lower galleries',
    body: 'The terrifying revelation occurs when the librarians begin burning books to find the one true Crimson Hexagon index! [Spoiler: The index itself is merely another endless room.]',
    contains_spoiler: true,
    helpful_count: 18,
    moderation_status: 'APPROVED',
    created_at: '2025-01-12T16:20:00Z',
    updated_at: '2025-01-12T16:20:00Z',
    author: {
      id: 'u-2002-warden',
      username: 'warden',
      display_name: 'Keeper Vane',
    },
  },
];

export const handlers = [
  // 1. Health
  http.get('/api/health/', () => {
    return HttpResponse.json({ status: 'ok', service: 'Akashic Library API' });
  }),

  // 2. Auth
  http.get('/api/auth/me/', () => {
    if (!currentUser) {
      // Per Section 2 & 3.2: returns 403 when not logged in
      return HttpResponse.json({ detail: 'Authentication credentials were not provided.' }, { status: 403 });
    }
    return HttpResponse.json(currentUser);
  }),

  http.post('/api/auth/login/', async ({ request }) => {
    const body = (await request.json()) as any;
    const { username } = body || {};
    const found = Object.values(SEEDED_USERS).find((u) => u.username === username);
    if (found) {
      currentUser = found;
      return HttpResponse.json({ detail: 'Successfully logged in.', user: found });
    }
    currentUser = {
      id: 'u-custom-' + Date.now(),
      username: username || 'scholar',
      email: `${username || 'scholar'}@akashic.org`,
      role: 'USER',
      display_name: username || 'Scholar',
      bio: 'Independent researcher.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ detail: 'Successfully logged in.', user: currentUser });
  }),

  http.post('/api/auth/register/', async ({ request }) => {
    const body = (await request.json()) as any;
    currentUser = {
      id: 'u-' + Date.now(),
      username: body.username || 'new_scholar',
      email: body.email || 'scholar@library.org',
      role: 'USER',
      display_name: body.username,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json({ detail: 'User registered.', user: currentUser }, { status: 201 });
  }),

  http.post('/api/auth/logout/', () => {
    currentUser = null;
    return HttpResponse.json({ detail: 'Logged out.' });
  }),

  // 3. Books
  http.get('/api/books/', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase() || '';
    const author = url.searchParams.get('author')?.toLowerCase() || '';
    const subject = url.searchParams.get('subject')?.toLowerCase() || '';

    let results = MOCK_BOOKS.filter((b) => {
      if (q && !b.title.toLowerCase().includes(q) && !b.authors.some((a) => a.toLowerCase().includes(q))) {
        return false;
      }
      if (author && !b.authors.some((a) => a.toLowerCase().includes(author))) return false;
      if (subject && !b.subjects.some((s) => s.toLowerCase().includes(subject))) return false;
      return true;
    });

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results: results.map((b) => ({
        id: b.id,
        title: b.title,
        authors: b.authors,
        cover_url: b.covers[0] || null,
        language: b.publication.language,
        published_date: b.publication.published_date,
        rating: b.community.average_rating,
        review_count: b.community.rating_count,
        in_store: b.in_store,
      })),
    });
  }),

  http.get('/api/books/:id/', ({ params }) => {
    const book = MOCK_BOOKS.find((b) => b.id === params.id) || MOCK_BOOKS[0];
    return HttpResponse.json(book);
  }),

  http.get('/api/books/:id/rating/', ({ params }) => {
    const book = MOCK_BOOKS.find((b) => b.id === params.id) || MOCK_BOOKS[0];
    return HttpResponse.json(book.community);
  }),

  http.post('/api/books/import/', async ({ request }) => {
    const body = (await request.json()) as any;
    const newBook = {
      id: 'book-imported-' + Date.now(),
      title: `Imported Volume (${body.external_id})`,
      authors: ['Discovered Scholar'],
      description: 'Preserved manuscript imported from external bibliographic provider.',
      identifiers: { isbn10: '0000000000', isbn13: '9780000000000' },
      publication: { publisher: 'Universal Archives', published_date: '2024', language: 'en', page_count: 240 },
      subjects: ['Imported Acquisitions'],
      covers: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
      community: { average_rating: null, rating_count: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } },
      store: { available: false, product_id: null },
      in_store: false,
    };
    MOCK_BOOKS.unshift(newBook);
    return HttpResponse.json(newBook, { status: 201 });
  }),

  // 4. Reviews
  http.get('/api/books/:id/reviews/', ({ params }) => {
    const filtered = reviews.filter((r) => r.book_id === params.id);
    return HttpResponse.json({
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered,
    });
  }),

  http.post('/api/books/:id/reviews/', async ({ request, params }) => {
    if (!currentUser) return HttpResponse.json({ detail: 'Authentication required' }, { status: 403 });
    const body = (await request.json()) as any;
    const existing = reviews.find((r) => r.book_id === params.id && r.user_id === currentUser?.id);
    if (existing) {
      return HttpResponse.json({ detail: 'You have already reviewed this book.' }, { status: 409 });
    }
    const newRev = {
      id: 'rev-' + Date.now(),
      book_id: params.id as string,
      user_id: currentUser.id,
      rating: body.rating,
      title: body.title || null,
      body: body.body,
      contains_spoiler: Boolean(body.contains_spoiler),
      helpful_count: 0,
      moderation_status: 'APPROVED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: currentUser.id,
        username: currentUser.username,
        display_name: currentUser.display_name,
      },
    };
    reviews.unshift(newRev);
    return HttpResponse.json(newRev, { status: 201 });
  }),

  http.patch('/api/books/:id/reviews/:revId/update/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const rev = reviews.find((r) => r.id === params.revId);
    if (rev) {
      if (body.rating !== undefined) rev.rating = body.rating;
      if (body.title !== undefined) rev.title = body.title;
      if (body.body !== undefined) rev.body = body.body;
      if (body.contains_spoiler !== undefined) rev.contains_spoiler = body.contains_spoiler;
      rev.updated_at = new Date().toISOString();
      return HttpResponse.json(rev);
    }
    return HttpResponse.json({ detail: 'Review not found' }, { status: 404 });
  }),

  http.delete('/api/books/:id/reviews/:revId/delete/', ({ params }) => {
    reviews = reviews.filter((r) => r.id !== params.revId);
    return new HttpResponse(null, { status: 204 });
  }),

  // 5. Library
  http.get('/api/library/', () => {
    return HttpResponse.json({
      count: libraryEntries.length,
      next: null,
      previous: null,
      results: libraryEntries,
    });
  }),

  http.get('/api/library/:id/', ({ params }) => {
    const entry = libraryEntries.find((e) => e.book_id === params.id);
    if (entry) return HttpResponse.json(entry);
    return HttpResponse.json({ detail: 'Book is not on your shelf' }, { status: 404 });
  }),

  http.post('/api/library/:id/add/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const existing = libraryEntries.find((e) => e.book_id === params.id);
    if (existing) {
      return HttpResponse.json({ detail: 'Book already shelved.' }, { status: 409 });
    }
    const book = MOCK_BOOKS.find((b) => b.id === params.id);
    const newEntry = {
      id: 'lib-' + Date.now(),
      book_id: params.id as string,
      status: body.status || 'WANT_TO_READ',
      favorited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      book: {
        id: params.id,
        title: book?.title || 'Unknown Title',
        authors: book?.authors || [],
        cover_url: book?.covers[0] || null,
      },
    };
    libraryEntries.push(newEntry);
    return HttpResponse.json(newEntry, { status: 201 });
  }),

  http.patch('/api/library/:id/update/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const entry = libraryEntries.find((e) => e.book_id === params.id);
    if (entry) {
      entry.status = body.status;
      entry.updated_at = new Date().toISOString();
      return HttpResponse.json(entry);
    }
    return HttpResponse.json({ detail: 'Not shelved' }, { status: 404 });
  }),

  http.delete('/api/library/:id/remove/', ({ params }) => {
    libraryEntries = libraryEntries.filter((e) => e.book_id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/library/:id/favorite/', ({ params }) => {
    const entry = libraryEntries.find((e) => e.book_id === params.id);
    if (entry) entry.favorited = true;
    return HttpResponse.json({ id: 'fav-' + Date.now(), book_id: params.id, created_at: new Date().toISOString(), book: {} });
  }),

  http.delete('/api/library/:id/unfavorite/', ({ params }) => {
    const entry = libraryEntries.find((e) => e.book_id === params.id);
    if (entry) entry.favorited = false;
    return new HttpResponse(null, { status: 204 });
  }),

  // 6. Store
  http.get('/api/store/products/', () => {
    const visible = MOCK_STORE_PRODUCTS.filter((p) => (p.status as string) !== 'DISCONTINUED');
    return HttpResponse.json({
      count: visible.length,
      next: null,
      previous: null,
      results: visible,
    });
  }),

  http.get('/api/store/products/:id/', ({ params }) => {
    const p = MOCK_STORE_PRODUCTS.find((item) => item.id === params.id) || MOCK_STORE_PRODUCTS[0];
    return HttpResponse.json(p);
  }),

  http.post('/api/store/products/manage/', async ({ request }) => {
    const body = (await request.json()) as any;
    const newProd = {
      id: 'prod-' + Date.now(),
      book_reference: body.book_reference,
      edition: body.edition || 'Trade Hardcover',
      condition: body.condition || 'Fine',
      price: body.price,
      status: body.status || 'IN_STOCK',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inventory: {
        quantity: body.quantity || 10,
        reserved_quantity: body.reserved_quantity || 0,
        available_quantity: (body.quantity || 10) - (body.reserved_quantity || 0),
      },
    };
    MOCK_STORE_PRODUCTS.push(newProd);
    return HttpResponse.json(newProd, { status: 201 });
  }),

  http.patch('/api/store/products/:id/manage/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const p = MOCK_STORE_PRODUCTS.find((item) => item.id === params.id);
    if (p) {
      if (body.price !== undefined) p.price = body.price;
      if (body.edition !== undefined) p.edition = body.edition;
      if (body.condition !== undefined) p.condition = body.condition;
      if (body.status !== undefined) p.status = body.status;
      return HttpResponse.json(p);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.patch('/api/store/products/:id/inventory/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const p = MOCK_STORE_PRODUCTS.find((item) => item.id === params.id);
    if (p) {
      const q = body.quantity !== undefined ? body.quantity : p.inventory.quantity;
      const r = body.reserved_quantity !== undefined ? body.reserved_quantity : p.inventory.reserved_quantity;
      if (q < r) {
        return HttpResponse.json({ detail: 'Quantity must be >= reserved quantity.' }, { status: 400 });
      }
      p.inventory.quantity = q;
      p.inventory.reserved_quantity = r;
      p.inventory.available_quantity = q - r;
      if ((p.status as string) !== 'DISCONTINUED') {
        p.status = q - r <= 0 ? 'OUT_OF_STOCK' : q - r <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
      }
      return HttpResponse.json(p);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  // 7. Cart
  http.get('/api/cart/', () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.line_subtotal, 0);
    return HttpResponse.json({
      id: 'cart-active',
      status: 'ACTIVE',
      cart_subtotal: subtotal,
      items: cartItems,
      created_at: '2025-01-20T10:00:00Z',
      updated_at: '2025-01-20T10:00:00Z',
    });
  }),

  http.post('/api/cart/items/', async ({ request }) => {
    const body = (await request.json()) as any;
    const prod = MOCK_STORE_PRODUCTS.find((p) => p.id === body.product_id);
    if (!prod) return HttpResponse.json({ detail: 'Product not found' }, { status: 404 });
    const existing = cartItems.find((it) => it.product_id === body.product_id);
    if (existing) {
      existing.quantity += body.quantity || 1;
      existing.line_subtotal = existing.quantity * existing.current_price;
      return HttpResponse.json(existing, { status: 201 });
    }
    const newItem = {
      id: 'cart-item-' + Date.now(),
      product_id: prod.id,
      book_reference: prod.book_reference,
      edition: prod.edition,
      condition: prod.condition,
      current_price: prod.price,
      quantity: body.quantity || 1,
      available_quantity: prod.inventory.available_quantity,
      line_subtotal: (body.quantity || 1) * prod.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    cartItems.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.patch('/api/cart/items/:id/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const it = cartItems.find((item) => item.id === params.id);
    if (it) {
      it.quantity = body.quantity;
      it.line_subtotal = it.quantity * it.current_price;
      return HttpResponse.json(it);
    }
    return HttpResponse.json({ detail: 'Item not found' }, { status: 404 });
  }),

  http.delete('/api/cart/items/:id/', ({ params }) => {
    cartItems = cartItems.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // 8. Checkout & Orders
  http.post('/api/checkout/', () => {
    if (cartItems.length === 0) {
      return HttpResponse.json({ error: 'Cannot checkout an empty trolley.' }, { status: 400 });
    }
    const subtotal = cartItems.reduce((s, it) => s + it.line_subtotal, 0);
    const newOrder = {
      id: 'ord-' + Date.now(),
      status: 'CONFIRMED' as const,
      payment_status: 'PAID' as const,
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2),
      items: cartItems.map((it) => ({
        id: 'ord-item-' + Date.now(),
        product_id: it.product_id,
        title: `${it.edition} (${it.condition})`,
        quantity: it.quantity,
        price: it.current_price.toFixed(2),
        line_total: it.line_subtotal.toFixed(2),
      })),
      created_at: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    cartItems = [];
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.get('/api/orders/', () => {
    return HttpResponse.json({
      count: orders.length,
      next: null,
      previous: null,
      results: orders,
    });
  }),

  http.get('/api/orders/:id/', ({ params }) => {
    const ord = orders.find((o) => o.id === params.id) || orders[0];
    return HttpResponse.json(ord);
  }),

  // 9. Community
  http.get('/api/community/discussions/', ({ request }) => {
    const url = new URL(request.url);
    const topic = url.searchParams.get('topic_type');
    const bookId = url.searchParams.get('book_id');
    let res = discussions;
    if (topic) res = res.filter((d) => d.topic_type === topic);
    if (bookId) res = res.filter((d) => d.book_id === bookId);
    return HttpResponse.json(res);
  }),

  http.post('/api/community/discussions/', async ({ request }) => {
    if (!currentUser) return HttpResponse.json({ detail: 'Auth required' }, { status: 403 });
    const body = (await request.json()) as any;
    const newD = {
      id: 'disc-' + Date.now(),
      book_id: body.book_id || null,
      topic_type: body.topic_type || 'GENERAL',
      author_user_id: currentUser.id,
      title: body.title,
      body: body.body,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
      moderation_status: 'VISIBLE',
    };
    discussions.unshift(newD);
    return HttpResponse.json(newD, { status: 201 });
  }),

  http.get('/api/community/discussions/:id/', ({ params }) => {
    const d = discussions.find((item) => item.id === params.id) || discussions[0];
    return HttpResponse.json(d);
  }),

  http.patch('/api/community/discussions/:id/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const d = discussions.find((item) => item.id === params.id);
    if (d) {
      if (body.title) d.title = body.title;
      if (body.body) d.body = body.body;
      d.updated_at = Date.now() / 1000;
      return HttpResponse.json(d);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/community/discussions/:id/', ({ params }) => {
    discussions = discussions.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/community/discussions/:id/replies/', ({ params }) => {
    const res = replies.filter((r) => r.discussion_id === params.id);
    return HttpResponse.json(res);
  }),

  http.post('/api/community/discussions/:id/replies/', async ({ request, params }) => {
    if (!currentUser) return HttpResponse.json({ detail: 'Auth required' }, { status: 403 });
    const body = (await request.json()) as any;
    const newRep = {
      id: 'rep-' + Date.now(),
      discussion_id: params.id,
      author_user_id: currentUser.id,
      body: body.body,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
      moderation_status: 'VISIBLE',
    };
    replies.push(newRep);
    return HttpResponse.json(newRep, { status: 201 });
  }),

  http.patch('/api/community/replies/:id/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const r = replies.find((item) => item.id === params.id);
    if (r) {
      r.body = body.body;
      r.updated_at = Date.now() / 1000;
      return HttpResponse.json(r);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.delete('/api/community/replies/:id/', ({ params }) => {
    replies = replies.filter((item) => item.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/community/reports/', async ({ request }) => {
    const body = (await request.json()) as any;
    const newReport = {
      id: 'rep-' + Date.now(),
      reporter_user_id: currentUser?.id || 'anon',
      target_type: body.target_type,
      target_id: body.target_id,
      reason: body.reason,
      details: body.details || null,
      status: 'PENDING' as const,
      created_at: Date.now() / 1000,
      resolved_at: null,
      resolved_by_user_id: null,
      resolution_note: null,
    };
    reports.unshift(newReport);
    return HttpResponse.json(newReport, { status: 201 });
  }),

  http.get('/api/community/moderation/reports/', ({ request }) => {
    const url = new URL(request.url);
    const st = url.searchParams.get('status');
    let res = reports;
    if (st) res = res.filter((r) => r.status === st);
    return HttpResponse.json(res);
  }),

  http.patch('/api/community/moderation/reports/:id/', async ({ request, params }) => {
    const body = (await request.json()) as any;
    const r = reports.find((item) => item.id === params.id);
    if (r) {
      r.status = body.action || 'RESOLVED';
      r.resolution_note = body.note || null;
      r.resolved_at = Date.now() / 1000;
      r.resolved_by_user_id = currentUser?.id || 'mod';
      return HttpResponse.json(r);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.post('/api/community/moderation/hide/:type/:id/', ({ params }) => {
    if (params.type === 'DISCUSSION') {
      const d = discussions.find((item) => item.id === params.id);
      if (d) d.moderation_status = 'HIDDEN';
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('/api/community/moderation/restore/:type/:id/', ({ params }) => {
    if (params.type === 'DISCUSSION') {
      const d = discussions.find((item) => item.id === params.id);
      if (d) d.moderation_status = 'VISIBLE';
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // 10. Recommendations
  http.get('/api/recommendations/', () => {
    const recs = MOCK_BOOKS.slice(0, 6).map((b) => ({
      id: b.id,
      title: b.title,
      authors: b.authors.map((name) => ({ name })),
      description: b.description,
      covers: b.covers.map((url) => ({ url, source: 'mock' })),
      subjects: b.subjects,
      recommendation_reason: 'Because you like Labyrinths & Speculative Realism',
    }));
    return HttpResponse.json({
      count: 6,
      page: 1,
      page_size: 10,
      results: recs,
    });
  }),

  http.get('/api/recommendations/books/:id/similar/', ({ params }) => {
    const similar = MOCK_BOOKS.filter((b) => b.id !== params.id).slice(0, 4).map((b) => ({
      id: b.id,
      title: b.title,
      authors: b.authors.map((name) => ({ name })),
      description: b.description,
      covers: b.covers.map((url) => ({ url, source: 'mock' })),
      subjects: b.subjects,
      recommendation_reason: 'Similar metaphysical themes',
    }));
    return HttpResponse.json({
      count: similar.length,
      page: 1,
      page_size: 10,
      results: similar,
    });
  }),

  http.get('/api/recommendations/books/:id/external/', () => {
    return HttpResponse.json({
      google_books: 'https://books.google.com',
      open_library: 'https://openlibrary.org',
      goodreads: 'https://goodreads.com',
    });
  }),
];
