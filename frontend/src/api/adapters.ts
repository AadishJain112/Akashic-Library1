/**
 * Akashic Library Data Adapters & Normalizers
 * Transforms disparate backend schemas (DRF envelopes, flat community arrays,
 * RecBook vs BookListItem, epoch floats vs ISO dates) into clean UI domain models.
 */

export interface BookCardModel {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  language?: string | null;
  publishedDate?: string | null;
  rating?: number | null;
  reviewCount: number;
  inStore: boolean;
  subjects?: string[];
  recommendationReason?: string;
}

export interface ProceduralCover {
  bg: string;
  accent: string;
  border: string;
  pattern: 'celestial' | 'foliage' | 'geometric' | 'filigree' | 'minimal';
  spineColor: string;
}

const JEWEL_PALETTES: ProceduralCover[] = [
  { bg: '#1F8A70', accent: '#E6BC5C', border: '#176B57', pattern: 'foliage', spineColor: '#176B57' },     // Emerald
  { bg: '#C2334D', accent: '#F6EAD3', border: '#9A243A', pattern: 'filigree', spineColor: '#9A243A' },    // Ruby
  { bg: '#2F5DA8', accent: '#E6BC5C', border: '#21437B', pattern: 'celestial', spineColor: '#21437B' },   // Sapphire
  { bg: '#7A4FB5', accent: '#FBF4E6', border: '#5B378C', pattern: 'geometric', spineColor: '#5B378C' },   // Amethyst
  { bg: '#C97716', accent: '#2B2235', border: '#9A5809', pattern: 'celestial', spineColor: '#9A5809' },   // Saffron
  { bg: '#17939A', accent: '#FFFDF7', border: '#0F696E', pattern: 'foliage', spineColor: '#0F696E' },     // Teal
  { bg: '#C44E6E', accent: '#F6EAD3', border: '#9E3853', pattern: 'filigree', spineColor: '#9E3853' },    // Rose
  { bg: '#3F7D3A', accent: '#E6BC5C', border: '#2D5B29', pattern: 'foliage', spineColor: '#2D5B29' },     // Forest
  { bg: '#D2693C', accent: '#FFFDF7', border: '#A64B24', pattern: 'geometric', spineColor: '#A64B24' },   // Terracotta
];

export function sanitizeCoverUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = 'https://' + clean.slice(7);
  }
  return clean;
}

export function generateProceduralCover(title: string, authors: string[] = []): ProceduralCover {
  const seedStr = (title || 'Book') + (authors.join('') || 'Unknown');
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % JEWEL_PALETTES.length;
  return JEWEL_PALETTES[index];
}

export function fromBookListItem(item: any): BookCardModel {
  return {
    id: item.id || '',
    title: item.title || 'Untitled Volume',
    authors: Array.isArray(item.authors) ? item.authors : [],
    coverUrl: sanitizeCoverUrl(item.cover_url),
    language: item.language || null,
    publishedDate: item.published_date || null,
    rating: item.rating !== undefined ? item.rating : null,
    reviewCount: item.review_count || 0,
    inStore: Boolean(item.in_store),
  };
}

export function fromBookDetail(detail: any): BookCardModel {
  const primaryCover = Array.isArray(detail.covers) && detail.covers.length > 0 ? detail.covers[0] : null;
  return {
    id: detail.id || '',
    title: detail.title || 'Untitled Volume',
    authors: Array.isArray(detail.authors) ? detail.authors : [],
    coverUrl: sanitizeCoverUrl(primaryCover),
    language: detail.publication?.language || null,
    publishedDate: detail.publication?.published_date || null,
    rating: detail.community?.average_rating ?? null,
    reviewCount: detail.community?.rating_count || 0,
    inStore: Boolean(detail.store?.available),
    subjects: Array.isArray(detail.subjects) ? detail.subjects : [],
  };
}

export function fromRecBook(rec: any): BookCardModel {
  // RecBook has authors: [{name: '...'}] or ['...']
  const normalizedAuthors: string[] = Array.isArray(rec.authors)
    ? rec.authors.map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
    : [];

  // RecBook has covers: [{url: '...', source: '...'}] or ['...']
  let coverUrl: string | null = null;
  if (Array.isArray(rec.covers) && rec.covers.length > 0) {
    const first = rec.covers[0];
    coverUrl = typeof first === 'string' ? first : first?.url || null;
  }

  return {
    id: rec.id || '',
    title: rec.title || 'Untitled Tome',
    authors: normalizedAuthors,
    coverUrl: sanitizeCoverUrl(coverUrl),
    reviewCount: 0,
    inStore: false,
    subjects: Array.isArray(rec.subjects) ? rec.subjects : [],
    recommendationReason: rec.recommendation_reason || 'Librarian Recommendation',
  };
}

export function fromLibraryEntry(entry: any): BookCardModel & { shelfStatus: string; favorited: boolean } {
  const book = entry.book || {};
  return {
    id: entry.book_id || book.id || '',
    title: book.title || 'Untitled Work',
    authors: Array.isArray(book.authors) ? book.authors : [],
    coverUrl: sanitizeCoverUrl(book.cover_url),
    reviewCount: 0,
    inStore: false,
    shelfStatus: entry.status || 'WANT_TO_READ',
    favorited: Boolean(entry.favorited),
  };
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '₹0.00';
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return '₹0.00';
  return CURRENCY_FORMATTER.format(num);
}

export function formatDate(input: string | number | null | undefined): string {
  if (!input) return 'Date unknown';
  try {
    // If input is epoch seconds float (e.g. 1731600000.123), multiply by 1000
    if (typeof input === 'number' || (!isNaN(Number(input)) && !String(input).includes('-'))) {
      const ms = Number(input) * 1000;
      return new Date(ms).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    // Otherwise treat as ISO date string
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(input);
  }
}

/**
 * Deterministic reader avatar colors and initials from author_user_id
 */
export function getReaderIdentity(userId: string | null | undefined, myId?: string, myUsername?: string) {
  if (!userId) {
    return { name: 'Unknown Reader', initials: '?', bg: '#B9824A', tag: 'Reader' };
  }
  if (myId && userId === myId) {
    return {
      name: myUsername ? `You (${myUsername})` : 'You',
      initials: (myUsername || 'U').slice(0, 2).toUpperCase(),
      bg: '#1F8A70',
      tag: 'You',
    };
  }

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % JEWEL_PALETTES.length;
  const shortId = userId.slice(0, 4);

  return {
    name: `Reader · ${shortId}`,
    initials: shortId.slice(0, 2).toUpperCase(),
    bg: JEWEL_PALETTES[colorIndex].bg,
    tag: `Reader · ${shortId}`,
  };
}
