import { apiRequest } from './http';
import { PageEnvelope } from './books';

export interface ReviewAuthor {
  id: string;
  username: string;
  display_name: string | null;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number; // 1-5
  title: string | null;
  body: string;
  contains_spoiler: boolean;
  helpful_count: number;
  moderation_status: string;
  created_at: string;
  updated_at: string;
  author: ReviewAuthor;
}

export interface CreateReviewPayload {
  rating: number; // 1-5
  body: string;
  title?: string;
  contains_spoiler?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  body?: string;
  title?: string;
  contains_spoiler?: boolean;
}

export const reviewsApi = {
  async getBookReviews(bookId: string, page = 1, pageSize = 10): Promise<PageEnvelope<Review>> {
    return apiRequest<PageEnvelope<Review>>(`/api/books/${bookId}/reviews/`, {
      params: { page, page_size: pageSize },
    });
  },

  async getReviewDetail(bookId: string, reviewId: string): Promise<Review> {
    return apiRequest<Review>(`/api/books/${bookId}/reviews/${reviewId}/`);
  },

  async createReview(bookId: string, payload: CreateReviewPayload): Promise<Review> {
    return apiRequest<Review>(`/api/books/${bookId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateReview(bookId: string, reviewId: string, payload: UpdateReviewPayload): Promise<Review> {
    return apiRequest<Review>(`/api/books/${bookId}/reviews/${reviewId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteReview(bookId: string, reviewId: string): Promise<null> {
    return apiRequest<null>(`/api/books/${bookId}/reviews/${reviewId}/delete/`, {
      method: 'DELETE',
    });
  },
};
