import { apiRequest } from './http';

export type ModerationStatus = 'VISIBLE' | 'HIDDEN' | 'DELETED';

export interface Discussion {
  id: string;
  book_id: string | null;
  topic_type: string;
  author_user_id: string;
  title: string;
  body: string;
  created_at: number; // epoch seconds float
  updated_at: number; // epoch seconds float
  moderation_status: ModerationStatus;
}

export interface Reply {
  id: string;
  discussion_id: string;
  author_user_id: string;
  body: string;
  created_at: number; // epoch seconds float
  updated_at: number; // epoch seconds float
  moderation_status: ModerationStatus;
}

export interface CreateDiscussionPayload {
  title: string;
  body: string;
  book_id?: string;
  topic_type?: string;
}

export interface UpdateDiscussionPayload {
  title?: string;
  body?: string;
}

export interface CreateReplyPayload {
  body: string;
}

export interface UpdateReplyPayload {
  body: string;
}

export interface CreateReportPayload {
  target_type: 'DISCUSSION' | 'REPLY';
  target_id: string;
  reason: string;
  details?: string;
}

export const communityApi = {
  async getDiscussions(params: {
    book_id?: string;
    topic_type?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<Discussion[]> {
    return apiRequest<Discussion[]>('/api/community/discussions/', { params });
  },

  async getDiscussionDetail(id: string): Promise<Discussion> {
    return apiRequest<Discussion>(`/api/community/discussions/${id}/`);
  },

  async createDiscussion(payload: CreateDiscussionPayload): Promise<Discussion> {
    return apiRequest<Discussion>('/api/community/discussions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateDiscussion(id: string, payload: UpdateDiscussionPayload): Promise<Discussion> {
    return apiRequest<Discussion>(`/api/community/discussions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteDiscussion(id: string): Promise<null> {
    return apiRequest<null>(`/api/community/discussions/${id}/`, {
      method: 'DELETE',
    });
  },

  async getReplies(discussionId: string, skip = 0, limit = 50): Promise<Reply[]> {
    return apiRequest<Reply[]>(`/api/community/discussions/${discussionId}/replies/`, {
      params: { skip, limit },
    });
  },

  async createReply(discussionId: string, payload: CreateReplyPayload): Promise<Reply> {
    return apiRequest<Reply>(`/api/community/discussions/${discussionId}/replies/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateReply(id: string, payload: UpdateReplyPayload): Promise<Reply> {
    return apiRequest<Reply>(`/api/community/replies/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteReply(id: string): Promise<null> {
    return apiRequest<null>(`/api/community/replies/${id}/`, {
      method: 'DELETE',
    });
  },

  async createReport(payload: CreateReportPayload): Promise<any> {
    return apiRequest('/api/community/reports/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
