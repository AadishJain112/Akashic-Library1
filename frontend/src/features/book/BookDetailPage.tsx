import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../../api/books';
import { libraryApi, ShelfStatus } from '../../api/library';
import { reviewsApi, CreateReviewPayload, Review } from '../../api/reviews';
import { recommendationsApi } from '../../api/recommendations';
import { communityApi } from '../../api/community';
import { cartApi } from '../../api/cart';
import { storeApi } from '../../api/store';
import {
  fromBookDetail,
  fromRecBook,
  formatPrice,
  formatDate,
  generateProceduralCover,
} from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { BookRatingTower } from '../../components/domain/BookRatingTower';
import { ReaderCard } from '../../components/domain/ReaderCard';
import { ReportDialog } from '../../components/domain/ReportDialog';
import { Coverflow3D } from '../../components/css3d/Coverflow3D';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import {
  Heart,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  Star,
  MessageSquare,
  Sparkles,
  Share2,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id || '';
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Local interaction states
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);
  const [isBookOpened, setIsBookOpened] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string } | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSpoiler, setReviewSpoiler] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [unveiledSpoilers, setUnveiledSpoilers] = useState<Record<string, boolean>>({});

  // 1. Book Detail Query
  const {
    data: book,
    isLoading: isBookLoading,
    isError: isBookError,
    error: bookError,
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => booksApi.getBookDetail(bookId),
    enabled: Boolean(bookId),
  });

  // 2. Library Entry Query (Check if on user's shelf)
  const { data: libraryEntry, refetch: refetchShelf } = useQuery({
    queryKey: ['library-entry', bookId],
    queryFn: () => libraryApi.getBookLibraryEntry(bookId),
    enabled: Boolean(user && bookId),
  });

  // 3. Reviews Query
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => reviewsApi.getBookReviews(bookId, 1, 20),
    enabled: Boolean(bookId),
  });

  // 4. External Portal Links
  const { data: externalLinks } = useQuery({
    queryKey: ['external-links', bookId],
    queryFn: () => recommendationsApi.getExternalLinks(bookId),
    enabled: Boolean(bookId),
  });

  // 5. Similar Books Query
  const { data: similarData } = useQuery({
    queryKey: ['similar-books', bookId],
    queryFn: () => recommendationsApi.getSimilarBooks(bookId, 1, 8),
    enabled: Boolean(bookId),
  });

  // 6. Discussions for this book
  const { data: bookDiscussions } = useQuery({
    queryKey: ['book-discussions', bookId],
    queryFn: () => communityApi.getDiscussions({ book_id: bookId, limit: 3 }),
    enabled: Boolean(bookId),
  });

  // 7. Store product detail if available in store
  const storeProductId = book?.store?.product_id;
  const { data: storeProduct } = useQuery({
    queryKey: ['store-product-detail', storeProductId],
    queryFn: () => (storeProductId ? storeApi.getProductDetail(storeProductId) : null),
    enabled: Boolean(storeProductId),
  });

  // MUTATIONS: Shelf Add / Update / Remove
  const shelfMutation = useMutation({
    mutationFn: async (targetStatus: ShelfStatus) => {
      if (libraryEntry) {
        return libraryApi.updateShelf(bookId, targetStatus);
      } else {
        return libraryApi.addToShelf(bookId, targetStatus);
      }
    },
    onSuccess: (_, status) => {
      const labels = {
        WANT_TO_READ: 'Want to Read',
        READING: 'Currently Reading',
        READ: 'Finished Reading',
      };
      success(`Added to your "${labels[status]}" shelf!`, 'Personal Library Updated');
      refetchShelf();
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to update personal shelf.');
    },
  });

  const removeShelfMutation = useMutation({
    mutationFn: () => libraryApi.removeFromShelf(bookId),
    onSuccess: () => {
      success('Removed from personal shelves.', 'Shelf Updated');
      refetchShelf();
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to remove from shelf.');
    },
  });

  // MUTATION: Favorite Toggle
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (libraryEntry?.favorited) {
        return libraryApi.unfavoriteBook(bookId);
      } else {
        return libraryApi.favoriteBook(bookId);
      }
    },
    onSuccess: () => {
      const willBeFav = !libraryEntry?.favorited;
      if (willBeFav) {
        success('Marked as personal archival favorite!', 'Heart Bookmark Saved');
        if (!libraryEntry) {
          info(
            'Add this book to a shelf so it displays in your Personal Favorites display case.',
            'Archival Note'
          );
        }
      } else {
        info('Removed from favorites.');
      }
      refetchShelf();
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not update favorite bookmark.');
    },
  });

  // MUTATION: Add to Cart / Trolley
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!storeProductId) throw new Error('Product not available in store');
      return cartApi.addItem(storeProductId, 1);
    },
    onSuccess: () => {
      success('Volume placed into your Book Trolley!', 'Added to Trolley');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to add to trolley.');
    },
  });

  // MUTATION: Create or Update Review
  const reviewMutation = useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      if (editingReviewId) {
        return reviewsApi.updateReview(bookId, editingReviewId, payload);
      } else {
        return reviewsApi.createReview(bookId, payload);
      }
    },
    onSuccess: () => {
      success(
        editingReviewId ? 'Your scholarly review has been amended.' : 'Your review has been inscribed!',
        'Review Submitted'
      );
      setReviewBody('');
      setReviewTitle('');
      setEditingReviewId(null);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
    onError: (err: any) => {
      if (err?.status === 409) {
        info('You already reviewed this manuscript. Switched to edit mode.', 'Notice');
        // Find existing review
        const existing = (reviewsData?.results || []).find((r) => r.author?.id === user?.id);
        if (existing) {
          setEditingReviewId(existing.id);
          setReviewRating(existing.rating);
          setReviewTitle(existing.title || '');
          setReviewBody(existing.body);
          setReviewSpoiler(existing.contains_spoiler);
        }
      } else {
        toastError(err?.message || 'Failed to submit review.');
      }
    },
  });

  // MUTATION: Delete Review
  const deleteReviewMutation = useMutation({
    mutationFn: (revId: string) => reviewsApi.deleteReview(bookId, revId),
    onSuccess: () => {
      success('Review removed from public archives.', 'Deleted');
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });

  if (isBookLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center animate-pulse">
        <div className="w-48 h-72 bg-wood/20 rounded-2xl mb-4" />
        <div className="h-8 bg-wood/30 rounded w-96 mb-2" />
        <div className="h-4 bg-wood/20 rounded w-64" />
      </div>
    );
  }

  if (isBookError || !book) {
    return (
      <ErrorFallback
        title="Manuscript Could Not Be Located"
        message={(bookError as any)?.message || 'This book could not be loaded from the catalog.'}
        onRetry={() => navigate('/catalogue')}
      />
    );
  }

  const covers = Array.isArray(book.covers) && book.covers.length > 0 ? book.covers : [];
  const currentCoverUrl = covers[selectedCoverIndex] || null;
  const procedural = generateProceduralCover(book.title, book.authors);

  const reviews = reviewsData?.results || [];
  const similarBooks = (similarData?.results || []).map(fromRecBook);

  const toggleSpoiler = (revId: string) => {
    setUnveiledSpoilers((prev) => ({ ...prev, [revId]: !prev[revId] }));
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12">
      {/* 1. HERO READING DESK: INTERACTIVE 3D TOME + METADATA PLAQUE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-parchment-50 p-6 md:p-10 rounded-3xl border-2 border-wood/20 shadow-parchment-lg parchment-texture">
        {/* Left Column: 3D Interactive Tome & Cover Stacks */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Large Interactive 3D Tome */}
          <div className="relative w-64 md:w-80 aspect-[2/3] perspective-1200 cursor-pointer group">
            <div
              onClick={() => setIsBookOpened(!isBookOpened)}
              className={clsx(
                'relative w-full h-full rounded-r-2xl rounded-l-md transition-transform duration-500 preserve-3d shadow-book group-hover:shadow-book-hover',
                isBookOpened ? 'rotate-y-20' : 'hover:-rotate-y-10'
              )}
            >
              {/* Cover Face */}
              <div
                className="absolute inset-0 rounded-r-2xl rounded-l-md overflow-hidden backface-hidden border-r-4 border-black/20 flex flex-col justify-between"
                style={{ backgroundColor: procedural.bg }}
              >
                {currentCoverUrl ? (
                  <img
                    src={currentCoverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-r-2xl rounded-l-md"
                  />
                ) : (
                  <div className="p-6 text-center my-auto">
                    <p
                      className="font-serif font-black text-2xl leading-tight"
                      style={{ color: procedural.accent }}
                    >
                      {book.title}
                    </p>
                    <div className="w-16 h-0.5 bg-brass mx-auto my-3" />
                    <p className="text-sm text-parchment-100 italic">
                      {book.authors.join(', ')}
                    </p>
                  </div>
                )}
                {/* Book Spine Shadow Overlay */}
                <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-ink-light mt-3 italic">
            ✦ Click volume to inspect binding
          </p>

          {/* Alternate Cover Gallery */}
          {covers.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full p-2">
              {covers.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCoverIndex(i)}
                  className={clsx(
                    'w-12 h-16 rounded border-2 overflow-hidden shadow shrink-0 transition-transform',
                    selectedCoverIndex === i
                      ? 'border-brass scale-105 ring-2 ring-brass/40'
                      : 'border-wood/30 opacity-70 hover:opacity-100'
                  )}
                >
                  <img src={c} alt="Alternate edition cover" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Facts Plaque, Shelf Slots, Favorite & Buy Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Subject Chips */}
            {book.subjects && book.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {book.subjects.slice(0, 6).map((subj) => (
                  <Link
                    key={subj}
                    to={`/catalogue?subject=${encodeURIComponent(subj)}`}
                    className="hover:scale-105 transition-transform"
                  >
                    <Badge variant="brass" size="sm">
                      {subj}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark leading-tight">
              {book.title}
            </h1>

            <p className="text-base text-wood-dark font-serif italic mt-1.5">
              By {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
            </p>

            {/* Publication Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-light mt-3 py-2 border-y border-wood/15">
              {book.publication?.publisher && (
                <span>
                  <strong>Publisher:</strong> {book.publication.publisher}
                </span>
              )}
              {book.publication?.published_date && (
                <span>
                  <strong>Date:</strong> {book.publication.published_date}
                </span>
              )}
              {book.publication?.page_count && (
                <span>
                  <strong>Pages:</strong> {book.publication.page_count}
                </span>
              )}
              {book.publication?.language && (
                <span className="uppercase font-mono">
                  <strong>Lang:</strong> {book.publication.language}
                </span>
              )}
              {book.identifiers?.isbn13 && (
                <span className="font-mono">
                  <strong>ISBN-13:</strong> {book.identifiers.isbn13}
                </span>
              )}
            </div>

            {/* Description with Expand/Collapse */}
            {book.description ? (
              <div className="mt-4">
                <p
                  className={clsx(
                    'text-sm text-ink leading-relaxed font-serif',
                    !isDescriptionExpanded && 'line-clamp-4'
                  )}
                >
                  {book.description}
                </p>
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-1 text-xs font-bold text-wood-dark hover:underline flex items-center gap-1"
                >
                  <span>{isDescriptionExpanded ? 'Collapse excerpt' : 'Read full excerpt'}</span>
                  {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <p className="text-xs text-ink-light italic mt-4 font-serif">
                No recorded excerpt exists in the archival description for this edition.
              </p>
            )}
          </div>

          {/* ACTION TOOLBAR: Shelf Slots, Favorite, Buy */}
          <div className="p-4 bg-parchment-100 rounded-2xl border border-wood/30 shadow-inner space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* My Shelf Slots */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-light">
                    My Shelf:
                  </span>
                  <div className="flex rounded-xl bg-parchment-50 p-1 border border-wood/30 shadow-sm">
                    {(['WANT_TO_READ', 'READING', 'READ'] as ShelfStatus[]).map((st) => {
                      const isCurrent = libraryEntry?.status === st;
                      const labels = {
                        WANT_TO_READ: 'Want to Read',
                        READING: 'Reading',
                        READ: 'Read',
                      };
                      return (
                        <button
                          key={st}
                          onClick={() => shelfMutation.mutate(st)}
                          disabled={shelfMutation.isPending}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                            isCurrent
                              ? 'bg-wood-dark text-parchment-50 shadow'
                              : 'text-ink-light hover:text-ink hover:bg-wood/10'
                          )}
                        >
                          {labels[st]}
                        </button>
                      );
                    })}
                  </div>

                  {libraryEntry && (
                    <button
                      onClick={() => removeShelfMutation.mutate()}
                      className="p-2 rounded-lg text-ink-light hover:text-jewel-ruby hover:bg-red-50 transition-colors"
                      title="Remove from shelves"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <Link to={`/login?redirect=/books/${bookId}`}>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <BookOpen className="w-4 h-4 text-wood-dark" />
                    <span>Log in to add to personal shelves</span>
                  </Button>
                </Link>
              )}

              {/* Favorite Bookmark Heart Button */}
              {user && (
                <button
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={clsx(
                    'p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm',
                    libraryEntry?.favorited
                      ? 'bg-jewel-ruby text-white border-jewel-ruby'
                      : 'bg-parchment-50 text-ink-dark border-wood/30 hover:bg-rose-50'
                  )}
                >
                  <Heart
                    className={clsx(
                      'w-4 h-4',
                      libraryEntry?.favorited ? 'fill-current' : 'text-jewel-ruby'
                    )}
                  />
                  <span>{libraryEntry?.favorited ? 'Favorited' : 'Favorite'}</span>
                </button>
              )}
            </div>

            {/* Bookshop Availability & Add To Trolley */}
            <div className="pt-3 border-t border-wood/20 flex flex-wrap items-center justify-between gap-4">
              {book.store?.available ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-jewel-emerald">
                      Available in Bookshop
                    </span>
                    <span className="font-serif font-bold text-lg text-ink-dark">
                      {storeProduct ? formatPrice(storeProduct.price) : 'Physical Print In Stock'}
                    </span>
                  </div>

                  {user ? (
                    <Button
                      variant="brass"
                      onClick={() => addToCartMutation.mutate()}
                      isLoading={addToCartMutation.isPending}
                      className="gap-2 shadow"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Trolley</span>
                    </Button>
                  ) : (
                    <Link to={`/login?redirect=/books/${bookId}`}>
                      <Button variant="brass" size="sm">
                        Log in to purchase
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <span className="text-xs text-ink-light italic">
                  Not available in the Bookshop right now.
                </span>
              )}

              {/* External Archival Portals (Google Books, Open Library, Goodreads) */}
              {externalLinks && Object.keys(externalLinks).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-light font-medium">External Portals:</span>
                  {externalLinks.google_books && (
                    <a
                      href={externalLinks.google_books}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-parchment-50 rounded-lg border border-wood/30 hover:border-wood text-ink-dark text-xs flex items-center gap-1 shadow-xs"
                      title="View on Google Books"
                    >
                      <span>Google Books</span>
                      <ExternalLink className="w-3 h-3 text-ink-light" />
                    </a>
                  )}
                  {externalLinks.open_library && (
                    <a
                      href={externalLinks.open_library}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-parchment-50 rounded-lg border border-wood/30 hover:border-wood text-ink-dark text-xs flex items-center gap-1 shadow-xs"
                      title="View on Open Library"
                    >
                      <span>Open Library</span>
                      <ExternalLink className="w-3 h-3 text-ink-light" />
                    </a>
                  )}
                  {externalLinks.goodreads && (
                    <a
                      href={externalLinks.goodreads}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-parchment-50 rounded-lg border border-wood/30 hover:border-wood text-ink-dark text-xs flex items-center gap-1 shadow-xs"
                      title="View on Goodreads"
                    >
                      <span>Goodreads</span>
                      <ExternalLink className="w-3 h-3 text-ink-light" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY CONSENSUS: 3D BOOK TOWER HISTOGRAM */}
      <section>
        <BookRatingTower
          averageRating={book.community?.average_rating}
          ratingCount={book.community?.rating_count || 0}
          distribution={book.community?.distribution}
        />
      </section>

      {/* 3. SCHOLARLY REVIEWS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
              Patron Testimonies
            </span>
            <h2 className="font-serif text-2xl font-extrabold text-ink-dark mt-0.5">
              Archival Reviews & Critiques
            </h2>
          </div>
          <span className="text-xs text-ink-light font-medium">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} inscribed
          </span>
        </div>

        {/* INKWELL AND QUILL COMPOSER */}
        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (reviewBody.trim()) {
                reviewMutation.mutate({
                  rating: reviewRating,
                  title: reviewTitle.trim() || undefined,
                  body: reviewBody.trim(),
                  contains_spoiler: reviewSpoiler,
                });
              }
            }}
            className="p-6 bg-parchment-50 rounded-2xl border-2 border-wood/25 shadow-parchment parchment-texture space-y-4"
          >
            <div className="flex items-center justify-between border-b border-wood/20 pb-3">
              <h4 className="font-serif font-bold text-sm text-ink-dark flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-wood-dark" />
                <span>
                  {editingReviewId ? 'Amend Your Inscription' : 'Inscribe Your Review & Rating'}
                </span>
              </h4>

              {/* Star Rating Picker (1-5) */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-500 focus:outline-none hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={clsx(
                        'w-5 h-5',
                        reviewRating >= star ? 'fill-current' : 'text-wood/30'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Review Title (Optional, max 500 characters)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value.slice(0, 500))}
              placeholder="e.g. A labyrinthine meditation on memory and time"
              maxLength={500}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1">
                Critique & Analysis (Required, max 10,000 characters)
              </label>
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value.slice(0, 10000))}
                rows={4}
                required
                placeholder="Compose your thoughts on this volume for fellow patrons..."
                className="w-full p-3.5 rounded-xl text-sm bg-parchment-100 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink shadow-inner placeholder:text-ink-light/50 font-serif leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-ink-light mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reviewSpoiler}
                    onChange={(e) => setReviewSpoiler(e.target.checked)}
                    className="rounded text-wood-dark focus:ring-brass"
                  />
                  <span>Contains manuscript spoilers (conceal with velvet curtain)</span>
                </label>
                <span>{reviewBody.length} / 10,000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {editingReviewId && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setReviewTitle('');
                    setReviewBody('');
                  }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="brass"
                type="submit"
                isLoading={reviewMutation.isPending}
                disabled={!reviewBody.trim()}
                className="gap-2 shadow"
              >
                <span>{editingReviewId ? 'Save Changes' : 'Publish Review'}</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-parchment-200/50 rounded-xl border border-wood/20 text-center text-xs text-ink-light">
            <Link to={`/login?redirect=/books/${bookId}`} className="font-bold text-wood-dark hover:underline">
              Log in to inscribe your review and rating.
            </Link>
          </div>
        )}

        {/* REVIEWS LIST AS PARCHMENT NOTES */}
        <div className="space-y-4">
          {reviews.map((rev) => {
            const isOwner = user && rev.author?.id === user.id;
            const isSpoilerConcealed = rev.contains_spoiler && !unveiledSpoilers[rev.id];

            return (
              <div
                key={rev.id}
                className="p-5 bg-parchment-50 rounded-2xl border border-wood/20 shadow-sm parchment-texture space-y-3"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ReaderCard
                      userId={rev.author?.id}
                      username={rev.author?.username || 'scholar'}
                      displayName={rev.author?.display_name}
                    />
                    <span className="text-xs text-ink-light">· {formatDate(rev.created_at)}</span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={clsx(
                          'w-3.5 h-3.5',
                          rev.rating >= s ? 'fill-current' : 'text-wood/20'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Title */}
                {rev.title && (
                  <h4 className="font-serif font-bold text-base text-ink-dark">{rev.title}</h4>
                )}

                {/* Body or Velvet Spoiler Curtain */}
                {isSpoilerConcealed ? (
                  <div
                    onClick={() => toggleSpoiler(rev.id)}
                    className="p-6 rounded-xl text-center cursor-pointer velvet-curtain text-parchment-100 shadow select-none group"
                  >
                    <span className="text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 text-brass-light">
                      <Eye className="w-4 h-4" />
                      <span>Concealed by Velvet Curtain · Contains Spoilers</span>
                    </span>
                    <p className="text-[11px] text-parchment-200 mt-1">
                      Click to draw the curtain aside and read critique
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-ink leading-relaxed font-serif whitespace-pre-line">
                    {rev.body}
                  </p>
                )}

                {/* Footer with Helpful & Owner Controls */}
                <div className="pt-2 border-t border-wood/15 flex items-center justify-between text-xs text-ink-light">
                  <span>Helpful consensus: {rev.helpful_count}</span>

                  <div className="flex items-center gap-3">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => {
                            setEditingReviewId(rev.id);
                            setReviewRating(rev.rating);
                            setReviewTitle(rev.title || '');
                            setReviewBody(rev.body);
                            setReviewSpoiler(rev.contains_spoiler);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className="text-wood-dark hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Erase your inscribed review from the archive?')) {
                              deleteReviewMutation.mutate(rev.id);
                            }
                          }}
                          className="text-jewel-ruby hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {reviews.length === 0 && (
            <div className="p-8 text-center bg-parchment-50 rounded-2xl border border-wood/20 text-xs text-ink-light font-serif">
              No scholars have inscribed a review for this manuscript yet. Be the first to record your impressions!
            </div>
          )}
        </div>
      </section>

      {/* 4. DISCUSSIONS ABOUT THIS BOOK */}
      {bookDiscussions && (
        <section className="bg-parchment-200/50 p-6 rounded-3xl border border-wood/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-xl text-ink-dark flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-jewel-amethyst" />
              <span>Reading Circle Dialogues On This Volume</span>
            </h3>
            <Link
              to={`/circle?book_id=${bookId}`}
              className="text-xs font-bold text-jewel-amethyst hover:underline"
            >
              Start A Dialogue
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookDiscussions.map((disc) => (
              <Link
                key={disc.id}
                to={`/circle/${disc.id}`}
                className="p-4 bg-parchment-50 rounded-xl border border-wood/20 hover:border-jewel-amethyst shadow-sm transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-jewel-amethyst">
                  {disc.topic_type}
                </span>
                <h5 className="font-serif font-bold text-sm text-ink-dark line-clamp-1 mt-1">
                  {disc.title}
                </h5>
                <p className="text-xs text-ink-light line-clamp-2 mt-1 font-serif">{disc.body}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. SIMILAR BOOKS (3D Coverflow) */}
      {similarBooks.length > 0 && (
        <section className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
              Associated Literature
            </span>
            <h3 className="font-serif text-2xl font-extrabold text-ink-dark">
              Similar Archival Works
            </h3>
          </div>
          <Coverflow3D
            books={similarBooks}
            onSelectBook={(b) => navigate(`/books/${b.id}`)}
          />
        </section>
      )}
    </div>
  );
};
