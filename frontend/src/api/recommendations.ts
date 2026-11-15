import { apiRequest } from './http';

export interface RecBook {
  id: string;
  title: string;
  authors: Array<{ name: string } | string>;
  description?: string;
  covers: Array<{ url: string; source?: string } | string>;
  subjects: string[];
  recommendation_reason: string;
}

export interface RecommendationEnvelope {
  count: number;
  page: number;
  page_size: number;
  results: RecBook[];
}

export interface ExternalLinks {
  google_books?: string;
  open_library?: string;
  goodreads?: string;
}

export const recommendationsApi = {
  async getPersonalRecommendations(page = 1, pageSize = 20): Promise<RecommendationEnvelope> {
    return apiRequest<RecommendationEnvelope>('/api/recommendations/', {
      params: { page, page_size: pageSize },
    });
  },

  async getSimilarBooks(bookId: string, page = 1, pageSize = 10): Promise<RecommendationEnvelope> {
    return apiRequest<RecommendationEnvelope>(`/api/recommendations/books/${bookId}/similar/`, {
      params: { page, page_size: pageSize },
    });
  },

  async getExternalLinks(bookId: string): Promise<ExternalLinks> {
    return apiRequest<ExternalLinks>(`/api/recommendations/books/${bookId}/external/`);
  },
};
