import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  moderationApi,
  Report,
  ReportStatus,
} from '../../api/moderation';
import { communityApi, Discussion } from '../../api/community';
import { formatDate } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { TowerScene3D } from '../../components/three/TowerScene3D';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';

export const ModerationDeskPage: React.FC = () => {
  const { isMod, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Guard: MODERATOR or ADMIN only. STORE_MANAGER is blocked.
  if (!isMod) {
    return <Navigate to="/restricted" replace />;
  }

  const statusParam = (searchParams.get('status') as ReportStatus) || 'PENDING';
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Load reports list
  const { data: reports = [], refetch: refetchReports, isLoading } = useQuery({
    queryKey: ['moderation-reports', statusParam],
    queryFn: () => moderationApi.getReports({ status: statusParam, limit: 50 }),
  });

  // Target Discussion preview query (if target is DISCUSSION)
  const isDiscussionTarget = activeReport?.target_type === 'DISCUSSION';
  const { data: targetDiscussion } = useQuery({
    queryKey: ['target-discussion-preview', activeReport?.target_id],
    queryFn: () =>
      activeReport && isDiscussionTarget
        ? communityApi.getDiscussionDetail(activeReport.target_id)
        : null,
    enabled: Boolean(activeReport && isDiscussionTarget),
  });

  // MUTATION: Resolve / Dismiss Report
  const resolveMutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      note,
    }: {
      reportId: string;
      action: 'RESOLVED' | 'DISMISSED';
      note?: string;
    }) => moderationApi.updateReport(reportId, action, note),
    onSuccess: (_, { action }) => {
      success(`Report status updated to ${action}.`, 'Night Watch Logged');
      setActiveReport(null);
      setResolutionNote('');
      refetchReports();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not update report.');
    },
  });

  // MUTATION: Hide Content
  const hideMutation = useMutation({
    mutationFn: ({ targetType, id, note }: { targetType: 'DISCUSSION' | 'REPLY'; id: string; note?: string }) =>
      moderationApi.hideContent(targetType, id, note),
    onSuccess: () => {
      success('Target content has been hidden from the public Reading Circle.', 'Content Hidden');
      queryClient.invalidateQueries({ queryKey: ['target-discussion-preview'] });
      refetchReports();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to hide content.');
    },
  });

  // MUTATION: Restore Content
  const restoreMutation = useMutation({
    mutationFn: ({ targetType, id, note }: { targetType: 'DISCUSSION' | 'REPLY'; id: string; note?: string }) =>
      moderationApi.restoreContent(targetType, id, note),
    onSuccess: () => {
      success('Target content restored to public view.', 'Content Restored');
      queryClient.invalidateQueries({ queryKey: ['target-discussion-preview'] });
      refetchReports();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to restore content.');
    },
  });

  const setStatusTab = (st: ReportStatus) => {
    setSearchParams({ status: st });
    setActiveReport(null);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER WITH MIDNIGHT ACCENT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-jewel-amethyst">
            Night Watch Order
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Warden's Tower</span>
            <Shield className="w-7 h-7 text-jewel-amethyst" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Adjudicate reported scrolls, uphold library decorum, and inspect retracted manuscripts.
          </p>
        </div>

        {isAdmin && (
          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-wood-dark hover:bg-wood text-parchment-50 text-xs font-bold shadow transition-colors"
          >
            <Layers className="w-4 h-4 text-brass" />
            <span>Back Office (Django Admin)</span>
            <ExternalLink className="w-3.5 h-3.5 text-parchment-300" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 3D WARDEN'S TOWER SCENE (Midnight Plum accent) */}
        <div className="lg:col-span-4 bg-nightwatch-bg p-6 rounded-3xl border-2 border-brass-antique/40 shadow-2xl text-parchment-50 flex flex-col items-center select-none">
          <h3 className="font-serif font-bold text-xs uppercase tracking-widest text-brass mb-2">
            Night Watch Desk
          </h3>
          <div className="w-full h-56">
            <CanvasContainer camera={{ position: [0, 1.2, 3.8], fov: 40 }}>
              <TowerScene3D />
            </CanvasContainer>
          </div>
          <p className="text-[11px] text-parchment-200/70 italic text-center mt-2 font-serif">
            Midnight plum chamber overlooking the Akashic archives under celestial lantern light
          </p>
        </div>

        {/* RIGHT: REPORTS QUEUE & TARGET ADJUDICATION */}
        <div className="lg:col-span-8 bg-parchment-50 p-6 rounded-3xl border-2 border-wood/30 shadow-parchment parchment-texture space-y-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-parchment-100 rounded-2xl border border-wood/25 shadow-inner text-xs font-bold">
            {(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] as ReportStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-xl transition-all',
                  statusParam === tab
                    ? 'bg-jewel-amethyst text-white shadow'
                    : 'text-ink-light hover:text-ink'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Reports Table */}
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                onClick={() => setActiveReport(r)}
                className={clsx(
                  'p-4 rounded-2xl border transition-all cursor-pointer parchment-texture flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
                  activeReport?.id === r.id
                    ? 'border-2 border-brass bg-amber-50/50 shadow-md ring-2 ring-brass/30'
                    : 'border-wood/20 bg-parchment-100 hover:bg-parchment-200/60 shadow-xs'
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={r.target_type === 'DISCUSSION' ? 'brass' : 'violet'}>
                      {r.target_type}
                    </Badge>
                    <span className="font-bold text-xs text-ink-dark">{r.reason}</span>
                    <span className="text-[10px] text-ink-light font-mono">
                      #{r.id.slice(0, 8)}
                    </span>
                  </div>

                  {r.details && (
                    <p className="text-xs text-ink-light font-serif line-clamp-1 italic">
                      "{r.details}"
                    </p>
                  )}

                  <span className="text-[10px] text-ink-light flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Reported {formatDate(r.created_at)}</span>
                  </span>
                </div>

                <Button variant="secondary" size="sm" className="shrink-0">
                  {activeReport?.id === r.id ? 'Adjudicating' : 'Inspect'}
                </Button>
              </div>
            ))}

            {reports.length === 0 && (
              <p className="text-xs text-ink-light italic text-center py-8 font-serif">
                No reports found in the {statusParam} queue. The Reading Circle remains tranquil.
              </p>
            )}
          </div>

          {/* ACTIVE REPORT ADJUDICATION PLAQUE */}
          {activeReport && (
            <div className="pt-6 border-t-2 border-wood/20 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-base text-ink-dark">
                  Adjudicating Report #{activeReport.id.slice(0, 8)}
                </h4>
                <Badge variant="amber">{activeReport.status}</Badge>
              </div>

              {/* Target Preview */}
              <div className="p-4 bg-parchment-100 rounded-2xl border border-wood/30 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-light block">
                  Target: {activeReport.target_type} (ID: {activeReport.target_id})
                </span>

                {isDiscussionTarget && targetDiscussion && (
                  <div className="space-y-1 pt-1">
                    <h5 className="font-serif font-bold text-sm text-ink-dark">
                      {targetDiscussion.title}
                    </h5>
                    <p className="text-xs text-ink leading-relaxed font-serif whitespace-pre-line">
                      {targetDiscussion.body}
                    </p>
                    <div className="pt-2">
                      <Badge
                        variant={
                          targetDiscussion.moderation_status === 'VISIBLE'
                            ? 'emerald'
                            : 'ruby'
                        }
                      >
                        Status: {targetDiscussion.moderation_status}
                      </Badge>
                    </div>
                  </div>
                )}

                {!isDiscussionTarget && (
                  /* Target is REPLY: Explanation of backend limitation per prompt section 9.18 & 10 */
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 font-serif">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p>
                      The archival backend does not expose a single-reply fetch endpoint. Review the reporter's context below or inspect the parent discussion directly in the Reading Circle.
                    </p>
                  </div>
                )}
              </div>

              {/* Resolution Note Field */}
              <Input
                label="Warden's Resolution Note (Optional)"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Inscribe reasoning for resolution..."
              />

              {/* Action Buttons: Hide / Restore & Resolve / Dismiss */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* Hide / Restore Content */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      hideMutation.mutate({
                        targetType: activeReport.target_type,
                        id: activeReport.target_id,
                        note: resolutionNote || undefined,
                      })
                    }
                    className="gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Content</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      restoreMutation.mutate({
                        targetType: activeReport.target_type,
                        id: activeReport.target_id,
                        note: resolutionNote || undefined,
                      })
                    }
                    className="gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Restore Content</span>
                  </Button>
                </div>

                {/* Resolve or Dismiss Report */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      resolveMutation.mutate({
                        reportId: activeReport.id,
                        action: 'DISMISSED',
                        note: resolutionNote || undefined,
                      })
                    }
                    className="text-ink-light"
                  >
                    <XCircle className="w-4 h-4 mr-1 text-ink-light" />
                    <span>Dismiss Report</span>
                  </Button>

                  <Button
                    variant="brass"
                    size="sm"
                    onClick={() =>
                      resolveMutation.mutate({
                        reportId: activeReport.id,
                        action: 'RESOLVED',
                        note: resolutionNote || undefined,
                      })
                    }
                    className="gap-1.5 shadow"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-800" />
                    <span>Mark Resolved</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
