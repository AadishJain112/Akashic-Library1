import { apiRequest } from './http';
import { PageEnvelope } from './books';

export type ShelfStatus = 'WANT_TO_READ' | 'READING' | 'READ';

export interface LibraryEntry {
  id: string;
  book_id: string;
  status: ShelfStatus;
  favorited: boolean;
  created_at: string;
  updated_at: string;
  book: {
    id: string;
    title: string;
    authors: string[];
    cover_url: string | null;
  };
}

export const libraryApi = {
  async getLibraryEntries(page = 1, pageSize = 100): Promise<PageEnvelope<LibraryEntry>> {
    return apiRequest<PageEnvelope<LibraryEntry>>('/api/library/', {
      params: { page, page_size: pageSize },
    });
  },

  /**
   * Fetches all pages of user's library entries to group by status client-side
   */
  async getAllLibraryEntries(): Promise<LibraryEntry[]> {
    let allEntries: LibraryEntry[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const res = await this.getLibraryEntries(page, 100);
      allEntries = allEntries.concat(res.results || []);
      if (!res.next || (res.results && res.results.length < 100)) {
        hasNext = false;
      } else {
        page++;
      }
    }

    return allEntries;
  },

  async getBookLibraryEntry(bookId: string): Promise<LibraryEntry | null> {
    try {
      return await apiRequest<LibraryEntry>(`/api/library/${bookId}/`);
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  async addToShelf(bookId: string, status: ShelfStatus): Promise<LibraryEntry> {
    return apiRequest<LibraryEntry>(`/api/library/${bookId}/add/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async updateShelf(bookId: string, status: ShelfStatus): Promise<LibraryEntry> {
    return apiRequest<LibraryEntry>(`/api/library/${bookId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async removeFromShelf(bookId: string): Promise<null> {
    return apiRequest<null>(`/api/library/${bookId}/remove/`, {
      method: 'DELETE',
    });
  },

  async favoriteBook(bookId: string): Promise<{ id: string; book_id: string; created_at: string; book: any }> {
    return apiRequest<{ id: string; book_id: string; created_at: string; book: any }>(`/api/library/${bookId}/favorite/`, {
      method: 'POST',
    });
  },

  async unfavoriteBook(bookId: string): Promise<null> {
    return apiRequest<null>(`/api/library/${bookId}/unfavorite/`, {
      method: 'DELETE',
    });
  },
};
