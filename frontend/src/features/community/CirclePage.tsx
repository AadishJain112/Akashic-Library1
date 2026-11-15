import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { communityApi, CreateDiscussionPayload } from '../../api/community';
import { booksApi } from '../../api/books';
import { formatDate, getReaderIdentity } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  MessageSquare,
  PlusCircle,
  Clock,
  BookOpen,
  Filter,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';

const PRESET_TOPICS = ['ALL', 'GENERAL', 'BOOK CLUB', 'RECOMMENDATIONS', 'QUESTIONS', 'NEWS'];

export const CirclePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookIdParam = searchParams.get('book_id') || '';
  const topicParam = searchParams.get('topic_type') || 'ALL';

  const [topicType, setTopicType] = useState(topicParam);
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // New discussion composer state
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTopic, setNewTopic] = useState('GENERAL');
  const [newBookSearch, setNewBookSearch] = useState('');
  const [chosenBook, setChosenBook] = useState<{ id: string; title: string } | null>(null);

  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Load Discussions (Flat array from MongoDB with skip/limit)
  const { data: discussions = [], isLoading, refetch } = useQuery({
    queryKey: ['discussions', topicType, selectedBookId],
    queryFn: () =>
      communityApi.getDiscussions({
        topic_type: topicType === 'ALL' ? undefined : topicType,
        book_id: selectedBookId || undefined,
        limit: 50,
      }),
  });

  // Autocomplete query for books in composer
  const { data: bookSearchResults } = useQuery({
    queryKey: ['books-search-composer', newBookSearch],
    queryFn: () => booksApi.searchBooks({ q: newBookSearch, page_size: 5 }),
    enabled: Boolean(newBookSearch.length >= 2),
  });

  // Create discussion mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateDiscussionPayload) => communityApi.createDiscussion(payload),
    onSuccess: (newDisc) => {
      success('Your scroll has been hung upon the wall of the Reading Circle!', 'Dialogue Commenced');
      setIsComposerOpen(false);
      setNewTitle('');
      setNewBody('');
      setChosenBook(null);
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      navigate(`/circle/${newDisc.id}`);
    },
    onError: (err: any) => {
      if (err?.message?.toLowerCase().includes('spam') || err?.status === 400) {
        toastError('The quill needs a rest. Please pause a moment before inscribing another scroll.');
      } else {
        toastError(err?.message || 'Could not commence discussion.');
      }
    },
  });

  const handleSelectTopic = (topic: string) => {
    setTopicType(topic);
    const p = new URLSearchParams(searchParams);
    if (topic === 'ALL') p.delete('topic_type');
    else p.set('topic_type', topic);
    setSearchParams(p);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-jewel-amethyst">
            Scholarly Discourse
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Reading Circle</span>
            <MessageSquare className="w-7 h-7 text-jewel-amethyst" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            A communal notice wall of parchment scrolls, literary inquiries, and chapter debates.
          </p>
        </div>

        {user ? (
          <Button
            variant="brass"
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className="gap-2 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post A New Scroll</span>
          </Button>
        ) : (
          <Link to="/login?redirect=/circle">
            <Button variant="secondary" size="sm">
              Log in to commence a dialogue
            </Button>
          </Link>
        )}
      </div>

      {/* COMPOSER PANEL (Notice Wall) */}
      {isComposerOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim() && newBody.trim()) {
              createMutation.mutate({
                title: newTitle.trim(),
                body: newBody.trim(),
                topic_type: newTopic.trim() || 'GENERAL',
                book_id: chosenBook?.id || undefined,
              });
            }
          }}
          className="p-6 bg-parchment-50 rounded-3xl border-2 border-jewel-amethyst/40 shadow-parchment-lg parchment-texture space-y-4 animate-in fade-in slide-in-from-top-3"
        >
          <div className="flex items-center justify-between pb-3 border-b border-wood/20">
            <h3 className="font-serif font-bold text-lg text-ink-dark flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-jewel-amethyst" />
              <span>Inscribe A New Scroll for the Circle</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="text-xs text-ink-light hover:text-ink font-semibold"
            >
              ✕ Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Scroll Title (Max 255 characters)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value.slice(0, 255))}
              placeholder="e.g. Symbolism of the Labyrinth in Ficciones"
              required
              maxLength={255}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1.5">
                Topic Chamber
              </label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-parchment-100 border border-wood/30 text-ink focus:outline-none focus:ring-2 focus:ring-brass-dark"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="BOOK CLUB">BOOK CLUB</option>
                <option value="RECOMMENDATIONS">RECOMMENDATIONS</option>
                <option value="QUESTIONS">QUESTIONS</option>
                <option value="NEWS">NEWS</option>
              </select>
            </div>
          </div>

          {/* Optional Book Link Picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1">
              Associate With Manuscript (Optional)
            </label>
            {chosenBook ? (
              <div className="flex items-center justify-between p-2.5 bg-parchment-100 rounded-xl border border-wood/30 text-xs">
                <span className="font-serif font-bold text-ink-dark flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-wood-dark" />
                  <span>{chosenBook.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setChosenBook(null)}
                  className="text-jewel-ruby font-bold hover:underline"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={newBookSearch}
                  onChange={(e) => setNewBookSearch(e.target.value)}
                  placeholder="Type book title to search catalogue…"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-parchment-100 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark"
                />
                {bookSearchResults?.results && bookSearchResults.results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-parchment-50 rounded-xl border border-wood/30 shadow-lg z-20 overflow-hidden divide-y divide-wood/10">
                    {bookSearchResults.results.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setChosenBook({ id: b.id, title: b.title });
                          setNewBookSearch('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-wood/10 text-xs font-serif font-bold text-ink-dark flex items-center justify-between"
                      >
                        <span className="truncate">{b.title}</span>
                        <span className="text-[10px] text-ink-light shrink-0">
                          {b.authors.slice(0, 1).join('')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1">
              Scroll Body (Max 10,000 characters)
            </label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value.slice(0, 10000))}
              rows={5}
              required
              placeholder="State your proposition, inquiry, or reflection..."
              className="w-full p-3.5 rounded-xl text-sm bg-parchment-100 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink font-serif leading-relaxed shadow-inner"
            />
            <div className="text-right text-[10px] text-ink-light mt-1">
              {newBody.length} / 10,000
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsComposerOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brass"
              type="submit"
              isLoading={createMutation.isPending}
              disabled={!newTitle.trim() || !newBody.trim()}
              className="shadow"
            >
              Hang Scroll on Notice Wall
            </Button>
          </div>
        </form>
      )}

      {/* TOPIC FILTER CHIPS */}
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handleSelectTopic(topic)}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              topicType === topic
                ? 'bg-jewel-amethyst text-white border-jewel-amethyst shadow-sm'
                : 'bg-parchment-50 text-ink-dark border-wood/25 hover:bg-parchment-200'
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* DISCUSSIONS NOTICE WALL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {discussions.map((d) => {
          const authorIdent = getReaderIdentity(d.author_user_id, user?.id, user?.username);

          return (
            <Link
              key={d.id}
              to={`/circle/${d.id}`}
              className="p-6 bg-parchment-50 rounded-2xl border-2 border-wood/20 hover:border-jewel-amethyst shadow-sm hover:shadow-md transition-all parchment-texture flex flex-col justify-between group"
            >
              <div>
                {/* Topic & Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-jewel-amethyst/10 text-jewel-amethyst border border-jewel-amethyst/20">
                    {d.topic_type}
                  </span>
                  <span className="text-[11px] text-ink-light flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(d.created_at)}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-lg text-ink-dark group-hover:text-jewel-amethyst transition-colors leading-snug">
                  {d.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-ink-light font-serif line-clamp-3 mt-2 leading-relaxed">
                  {d.body}
                </p>
              </div>

              {/* Author Tag & Scroll Unroll CTA */}
              <div className="mt-5 pt-3 border-t border-wood/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: authorIdent.bg }}
                  >
                    {authorIdent.initials}
                  </div>
                  <span className="text-xs font-semibold text-ink-dark">{authorIdent.name}</span>
                </div>

                <span className="text-xs font-bold text-jewel-amethyst group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Unroll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {!isLoading && discussions.length === 0 && (
        <div className="p-12 text-center bg-parchment-50 rounded-3xl border border-wood/20 max-w-md mx-auto my-12 parchment-texture">
          <MessageSquare className="w-12 h-12 text-wood/60 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-xl text-ink-dark">The Notice Wall is Quiet</h3>
          <p className="text-xs text-ink-light mt-1 mb-4 font-serif">
            No scrolls currently hang in this chamber. Inscribe the inaugural query!
          </p>
        </div>
      )}
    </div>
  );
};
