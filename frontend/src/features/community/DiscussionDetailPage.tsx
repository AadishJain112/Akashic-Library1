import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communityApi,
  Discussion,
  Reply,
  CreateReplyPayload,
} from '../../api/community';
import { formatDate, getReaderIdentity } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ReportDialog } from '../../components/domain/ReportDialog';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import {
  MessageSquare,
  Clock,
  ArrowLeft,
  Trash2,
  Edit3,
  Flag,
  Send,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';

export const DiscussionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const discussionId = id || '';
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reply Composer State
  const [replyBody, setReplyBody] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyBody, setEditingReplyBody] = useState('');

  // Discussion Edit State
  const [isEditingDiscussion, setIsEditingDiscussion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  // Report Dialog State
  const [reportTarget, setReportTarget] = useState<{
    type: 'DISCUSSION' | 'REPLY';
    id: string;
  } | null>(null);

  // 1. Load Discussion Detail
  const {
    data: discussion,
    isLoading: isDiscLoading,
    isError: isDiscError,
    error: discError,
  } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: () => communityApi.getDiscussionDetail(discussionId),
    enabled: Boolean(discussionId),
  });

  // 2. Load Replies
  const { data: replies = [], refetch: refetchReplies } = useQuery({
    queryKey: ['replies', discussionId],
    queryFn: () => communityApi.getReplies(discussionId, 0, 100),
    enabled: Boolean(discussionId),
  });

  // MUTATION: Add Reply
  const replyMutation = useMutation({
    mutationFn: (body: string) => communityApi.createReply(discussionId, { body }),
    onSuccess: () => {
      success('Your reply slip has been added to the discussion.', 'Reply Appended');
      setReplyBody('');
      refetchReplies();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to submit reply.');
    },
  });

  // MUTATION: Edit Discussion
  const editDiscMutation = useMutation({
    mutationFn: (payload: { title?: string; body?: string }) =>
      communityApi.updateDiscussion(discussionId, payload),
    onSuccess: () => {
      success('Discussion manuscript revised.', 'Updated');
      setIsEditingDiscussion(false);
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not update discussion.');
    },
  });

  // MUTATION: Delete Discussion
  const deleteDiscMutation = useMutation({
    mutationFn: () => communityApi.deleteDiscussion(discussionId),
    onSuccess: () => {
      success('Scroll removed from the circle notice wall.', 'Deleted');
      navigate('/circle');
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to delete discussion.');
    },
  });

  // MUTATION: Edit Reply
  const editReplyMutation = useMutation({
    mutationFn: ({ replyId, body }: { replyId: string; body: string }) =>
      communityApi.updateReply(replyId, { body }),
    onSuccess: () => {
      success('Reply slip revised.', 'Updated');
      setEditingReplyId(null);
      refetchReplies();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to edit reply.');
    },
  });

  // MUTATION: Delete Reply
  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) => communityApi.deleteReply(replyId),
    onSuccess: () => {
      success('Reply slip removed.', 'Deleted');
      refetchReplies();
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to delete reply.');
    },
  });

  if (isDiscLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center animate-pulse">
        <div className="w-full h-48 bg-wood/15 rounded-3xl mb-4" />
        <div className="w-full h-32 bg-wood/10 rounded-2xl" />
      </div>
    );
  }

  if (isDiscError || !discussion) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="p-8 bg-parchment-50 rounded-3xl border border-wood/30 text-center max-w-md">
          <MessageSquare className="w-12 h-12 text-wood/60 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-xl text-ink-dark">
            This page has been removed from the shelves.
          </h3>
          <p className="text-xs text-ink-light mt-2 mb-6 font-serif">
            The requested scroll may have been retracted or archived by the Wardens.
          </p>
          <Link to="/circle">
            <Button variant="brass">Return to The Reading Circle</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === discussion.author_user_id;
  const authorIdent = getReaderIdentity(
    discussion.author_user_id,
    user?.id,
    user?.username
  );

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Back button */}
      <div>
        <Link
          to="/circle"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-wood-dark hover:text-ink-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reading Circle Notice Wall</span>
        </Link>
      </div>

      {/* 3D UNROLLING PARCHMENT SCROLL (Main Discussion Card) */}
      <article className="p-6 md:p-8 bg-parchment-50 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture space-y-4">
        {/* Scroll Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-wood/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow"
              style={{ backgroundColor: authorIdent.bg }}
            >
              {authorIdent.initials}
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-ink-dark">
                {authorIdent.name}
              </span>
              <p className="text-[11px] text-ink-light flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{formatDate(discussion.created_at)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-jewel-amethyst/10 text-jewel-amethyst border border-jewel-amethyst/20">
              {discussion.topic_type}
            </span>

            {/* Report Button */}
            {user && (
              <button
                onClick={() =>
                  setReportTarget({ type: 'DISCUSSION', id: discussion.id })
                }
                className="p-1.5 rounded-lg text-ink-light hover:text-jewel-ruby hover:bg-rose-50 transition-colors"
                title="Report scroll to Wardens"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Edit or Display Mode */}
        {isEditingDiscussion ? (
          <div className="space-y-4 pt-2">
            <Input
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={5}
              className="w-full p-3.5 rounded-xl text-sm bg-parchment-100 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass text-ink font-serif"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDiscussion(false)}
              >
                Cancel
              </Button>
              <Button
                variant="brass"
                size="sm"
                onClick={() =>
                  editDiscMutation.mutate({
                    title: editTitle.trim(),
                    body: editBody.trim(),
                  })
                }
                isLoading={editDiscMutation.isPending}
              >
                Save Revisions
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-ink-dark leading-snug">
              {discussion.title}
            </h1>
            <p className="text-sm md:text-base text-ink leading-relaxed font-serif whitespace-pre-line">
              {discussion.body}
            </p>
          </div>
        )}

        {/* Associated Book Link if present */}
        {discussion.book_id && (
          <div className="pt-4 border-t border-wood/15">
            <Link
              to={`/books/${discussion.book_id}`}
              className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-parchment-100 border border-wood/30 text-xs font-serif font-bold text-wood-dark hover:border-wood transition-colors"
            >
              <BookOpen className="w-4 h-4 text-brass-dark" />
              <span>Examine Referenced Manuscript in The Stacks</span>
            </Link>
          </div>
        )}

        {/* Owner Controls */}
        {isOwner && !isEditingDiscussion && (
          <div className="pt-4 border-t border-wood/15 flex items-center justify-end gap-3 text-xs">
            <button
              onClick={() => {
                setEditTitle(discussion.title);
                setEditBody(discussion.body);
                setIsEditingDiscussion(true);
              }}
              className="text-wood-dark hover:underline flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Amend Scroll</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Remove this scroll from the notice wall?')) {
                  deleteDiscMutation.mutate();
                }
              }}
              className="text-jewel-ruby hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Retract Scroll</span>
            </button>
          </div>
        )}
      </article>

      {/* REPLIES SECTION (Stacked Comment Slips) */}
      <section className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-ink-dark flex items-center gap-2">
          <span>Responses & Reflections</span>
          <span className="text-xs font-mono font-normal text-ink-light">
            ({replies.length})
          </span>
        </h3>

        {/* Reply Composer */}
        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (replyBody.trim()) {
                replyMutation.mutate(replyBody.trim());
              }
            }}
            className="p-4 bg-parchment-50 rounded-2xl border border-wood/25 shadow-sm space-y-3"
          >
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={3}
              placeholder="Contribute your perspective to this scholarly dialogue..."
              className="w-full p-3 rounded-xl text-xs bg-parchment-100 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink font-serif placeholder:text-ink-light/50"
            />
            <div className="flex items-center justify-end">
              <Button
                variant="brass"
                type="submit"
                size="sm"
                isLoading={replyMutation.isPending}
                disabled={!replyBody.trim()}
                className="gap-2 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Attach Reply Slip</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-parchment-200/50 rounded-xl border border-wood/20 text-center text-xs text-ink-light">
            <Link
              to={`/login?redirect=/circle/${discussionId}`}
              className="font-bold text-wood-dark hover:underline"
            >
              Log in to join this discourse.
            </Link>
          </div>
        )}

        {/* Stacked Chronological Comment Slips */}
        <div className="space-y-3">
          {replies.map((reply) => {
            const isReplyOwner = user && user.id === reply.author_user_id;
            const replyIdent = getReaderIdentity(
              reply.author_user_id,
              user?.id,
              user?.username
            );

            return (
              <div
                key={reply.id}
                className="p-4 bg-parchment-50 rounded-xl border border-wood/20 shadow-xs parchment-texture space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: replyIdent.bg }}
                    >
                      {replyIdent.initials}
                    </div>
                    <span className="font-semibold text-ink-dark">
                      {replyIdent.name}
                    </span>
                    <span className="text-[11px] text-ink-light">
                      · {formatDate(reply.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {user && (
                      <button
                        onClick={() =>
                          setReportTarget({ type: 'REPLY', id: reply.id })
                        }
                        className="text-ink-light hover:text-jewel-ruby p-1"
                        title="Report reply"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                    {isReplyOwner && (
                      <button
                        onClick={() => {
                          if (window.confirm('Remove this reply slip?')) {
                            deleteReplyMutation.mutate(reply.id);
                          }
                        }}
                        className="text-jewel-ruby hover:underline p-1 text-[11px] font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {editingReplyId === reply.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editingReplyBody}
                      onChange={(e) => setEditingReplyBody(e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs bg-parchment-100 rounded-lg border border-wood/30 text-ink"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReplyId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="brass"
                        size="sm"
                        onClick={() =>
                          editReplyMutation.mutate({
                            replyId: reply.id,
                            body: editingReplyBody,
                          })
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink leading-relaxed font-serif whitespace-pre-line">
                    {reply.body}
                  </p>
                )}
              </div>
            );
          })}

          {replies.length === 0 && (
            <p className="text-xs text-ink-light italic text-center py-6 font-serif">
              No replies inscribed yet. Be the first to share your perspective!
            </p>
          )}
        </div>
      </section>

      {/* REPORT MODAL */}
      {reportTarget && (
        <ReportDialog
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
};
