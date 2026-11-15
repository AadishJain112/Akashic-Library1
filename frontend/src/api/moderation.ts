import { apiRequest } from './http';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  reporter_user_id: string;
  target_type: 'DISCUSSION' | 'REPLY';
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: number; // epoch seconds float
  resolved_at: number | null;
  resolved_by_user_id: string | null;
  resolution_note: string | null;
}

export const moderationApi = {
  async getReports(params: {
    status?: ReportStatus;
    skip?: number;
    limit?: number;
  } = {}): Promise<Report[]> {
    return apiRequest<Report[]>('/api/community/moderation/reports/', { params });
  },

  async updateReport(id: string, action: 'RESOLVED' | 'DISMISSED', note?: string): Promise<Report> {
    return apiRequest<Report>(`/api/community/moderation/reports/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ action, note }),
    });
  },

  async hideContent(targetType: 'DISCUSSION' | 'REPLY', id: string, note?: string): Promise<null> {
    return apiRequest<null>(`/api/community/moderation/hide/${targetType}/${id}/`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },

  async restoreContent(targetType: 'DISCUSSION' | 'REPLY', id: string, note?: string): Promise<null> {
    return apiRequest<null>(`/api/community/moderation/restore/${targetType}/${id}/`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  },
};
