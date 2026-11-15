import { apiRequest } from './http';

export interface BookListItem {
  id: string;
  title: string;
  authors: string[];
  cover_url: string | null;
  language: string | null;
  published_date: string | null;
  rating: number | null;
  review_count: number;
  in_store: boolean;
}

export interface BookDetail {
  id: string;
  title: string;
  authors: string[];
  description: string | null;
  identifiers: {
    isbn10?: string;
    isbn13?: string;
  };
  publication: {
    publisher?: string;
    published_date?: string;
    language?: string;
    page_count?: number;
  };
  subjects: string[];
  covers: string[];
  community: {
    average_rating: number | null;
    rating_count: number;
    distribution: Record<string, number>;
  };
  store: {
    available: boolean;
    product_id: string | null;
  };
}

export interface BookSearchParams {
  [key: string]: string | number | boolean | undefined | null;
  q?: string;
  author?: string;
  isbn?: string;
  subject?: string;
  language?: string;
  publisher?: string;
  year_from?: number;
  year_to?: number;
  page?: number;
  page_size?: number;
}

export interface PageEnvelope<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BookRatingSummary {
  average_rating: number | null;
  rating_count: number;
  distribution: Record<string, number>;
}

export interface ImportBookPayload {
  provider: 'google_books' | 'open_library';
  external_id: string;
}

export const booksApi = {
  async searchBooks(params: BookSearchParams = {}): Promise<PageEnvelope<BookListItem>> {
    return apiRequest<PageEnvelope<BookListItem>>('/api/books/', { params });
  },

  async getBookDetail(id: string): Promise<BookDetail> {
    return apiRequest<BookDetail>(`/api/books/${id}/`);
  },

  async getBookRating(id: string): Promise<BookRatingSummary> {
    return apiRequest<BookRatingSummary>(`/api/books/${id}/rating/`);
  },

  async importBook(payload: ImportBookPayload): Promise<BookDetail> {
    return apiRequest<BookDetail>('/api/books/import/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
