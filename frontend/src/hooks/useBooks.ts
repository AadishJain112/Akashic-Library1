import { useQuery } from '@tanstack/react-query';
import { booksApi, BookDetail } from '../api/books';

const bookCache = new Map<string, Promise<BookDetail>>();

async function fetchBookWithDedupe(id: string): Promise<BookDetail> {
  if (!id) throw new Error('Missing book id');
  if (bookCache.has(id)) {
    return bookCache.get(id)!;
  }
  const promise = booksApi.getBookDetail(id).catch((err) => {
    bookCache.delete(id);
    throw err;
  });
  bookCache.set(id, promise);
  return promise;
}

export function useBook(id?: string | null) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => (id ? fetchBookWithDedupe(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });
}

export function useBooks(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  return useQuery({
    queryKey: ['books-batch', uniqueIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, BookDetail>> => {
      const results: Record<string, BookDetail> = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const detail = await fetchBookWithDedupe(id);
            results[id] = detail;
          } catch {
            // If individual book fails, don't fail entire batch
          }
        })
      );
      return results;
    },
    enabled: uniqueIds.length > 0,
    staleTime: 1000 * 60 * 15,
  });
}
