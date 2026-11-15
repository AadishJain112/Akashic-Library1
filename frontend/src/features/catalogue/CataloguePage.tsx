import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { booksApi, BookSearchParams } from '../../api/books';
import { fromBookListItem, BookCardModel } from '../../api/adapters';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Coverflow3D } from '../../components/css3d/Coverflow3D';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import { useAuth } from '../../app/AuthContext';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Columns,
  RotateCcw,
  BookOpen,
  Globe,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // URL state extraction
  const q = searchParams.get('q') || '';
  const author = searchParams.get('author') || '';
  const isbn = searchParams.get('isbn') || '';
  const subject = searchParams.get('subject') || '';
  const language = searchParams.get('language') || '';
  const publisher = searchParams.get('publisher') || '';
  const yearFromStr = searchParams.get('year_from') || '';
  const yearToStr = searchParams.get('year_to') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || '20', 10);

  // View mode switcher: 'shelf' | 'grid' | 'coverflow'
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'coverflow'>(() => {
    return (localStorage.getItem('akashic_catalogue_view') as any) || 'shelf';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Local filter form state
  const [localQ, setLocalQ] = useState(q);
  const [localAuthor, setLocalAuthor] = useState(author);
  const [localIsbn, setLocalIsbn] = useState(isbn);
  const [localSubject, setLocalSubject] = useState(subject);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [localPublisher, setLocalPublisher] = useState(publisher);
  const [localYearFrom, setLocalYearFrom] = useState(yearFromStr);
  const [localYearTo, setLocalYearTo] = useState(yearToStr);

  useEffect(() => {
    setLocalQ(q);
    setLocalAuthor(author);
    setLocalIsbn(isbn);
    setLocalSubject(subject);
    setLocalLanguage(language);
    setLocalPublisher(publisher);
    setLocalYearFrom(yearFromStr);
    setLocalYearTo(yearToStr);
  }, [q, author, isbn, subject, language, publisher, yearFromStr, yearToStr]);

  const setView = (mode: 'shelf' | 'grid' | 'coverflow') => {
    setViewMode(mode);
    localStorage.setItem('akashic_catalogue_view', mode);
  };

  // Build query params
  const queryPayload: BookSearchParams = {
    page,
    page_size: pageSize,
    q: q || undefined,
    author: author || undefined,
    isbn: isbn || undefined,
    subject: subject || undefined,
    language: language || undefined,
    publisher: publisher || undefined,
    year_from: yearFromStr ? parseInt(yearFromStr, 10) : undefined,
    year_to: yearToStr ? parseInt(yearToStr, 10) : undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['catalogue', queryPayload],
    queryFn: () => booksApi.searchBooks(queryPayload),
    retry: 1,
  });

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (localQ) newParams.set('q', localQ);
    if (localAuthor) newParams.set('author', localAuthor);
    if (localIsbn) newParams.set('isbn', localIsbn);
    if (localSubject) newParams.set('subject', localSubject);
    if (localLanguage) newParams.set('language', localLanguage);
    if (localPublisher) newParams.set('publisher', localPublisher);

    // Validate 4-digit years
    if (localYearFrom && /^\d{4}$/.test(localYearFrom)) newParams.set('year_from', localYearFrom);
    if (localYearTo && /^\d{4}$/.test(localYearTo)) newParams.set('year_to', localYearTo);

    newParams.set('page', '1');
    newParams.set('page_size', String(pageSize));
    setSearchParams(newParams);
    setIsDrawerOpen(false);
  };

  const resetFilters = () => {
    setLocalQ('');
    setLocalAuthor('');
    setLocalIsbn('');
    setLocalSubject('');
    setLocalLanguage('');
    setLocalPublisher('');
    setLocalYearFrom('');
    setLocalYearTo('');
    setSearchParams({ page: '1', page_size: String(pageSize) });
  };

  const goToPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setPageSizeAndReset = (newSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page_size', String(newSize));
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const books = (data?.results || []).map(fromBookListItem);
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      {/* HEADER & MAIN SEARCH BAR */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
              Archival Registry
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1">
              The Stacks (Catalogue)
            </h1>
            <p className="text-xs text-ink-light mt-1 font-serif">
              {totalCount > 0
                ? `Showing ${books.length} of ${totalCount} indexed volumes`
                : 'Search our universal repository and external archival networks.'}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-parchment-50 rounded-xl border border-wood/25 shadow-sm">
            <button
              onClick={() => setView('shelf')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                viewMode === 'shelf'
                  ? 'bg-wood-dark text-parchment-50 shadow'
                  : 'text-ink-light hover:text-ink'
              )}
              title="Shelf view: inspect book spines"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Shelf</span>
            </button>
            <button
              onClick={() => setView('grid')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                viewMode === 'grid'
                  ? 'bg-wood-dark text-parchment-50 shadow'
                  : 'text-ink-light hover:text-ink'
              )}
              title="Grid view: 3D tilt cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setView('coverflow')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                viewMode === 'coverflow'
                  ? 'bg-wood-dark text-parchment-50 shadow'
                  : 'text-ink-light hover:text-ink'
              )}
              title="Coverflow view: 3D rotating stage"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Coverflow</span>
            </button>
          </div>
        </div>

        {/* Primary Search Bar + Filter Drawer Button */}
        <form onSubmit={applyFilters} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-wood-dark absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Search by keywords, titles, excerpts…"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-parchment-50 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink shadow-inner placeholder:text-ink-light/50"
            />
          </div>

          <Button
            type="button"
            variant={isDrawerOpen ? 'brass' : 'secondary'}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="gap-2 shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Catalogue Drawer</span>
          </Button>

          <Button type="submit" variant="primary" className="gap-2 shrink-0">
            <Search className="w-4 h-4" />
            <span>Consult Stacks</span>
          </Button>
        </form>

        {/* CARD-CATALOGUE DRAWER PANEL */}
        {isDrawerOpen && (
          <div className="mt-4 p-5 bg-parchment-50 rounded-2xl border-2 border-brass-antique/60 shadow-parchment-lg parchment-texture animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between pb-3 border-b border-wood/20 mb-4">
              <h4 className="font-serif font-bold text-sm text-ink-dark flex items-center gap-2">
                <Filter className="w-4 h-4 text-brass-dark" />
                <span>Card-Catalogue Drawer Filters</span>
              </h4>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-wood-dark hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Drawer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <Input
                label="Author"
                value={localAuthor}
                onChange={(e) => setLocalAuthor(e.target.value)}
                placeholder="e.g. Jorge Luis Borges"
              />

              <Input
                label="Subject / Topic"
                value={localSubject}
                onChange={(e) => setLocalSubject(e.target.value)}
                placeholder="e.g. Philosophy, Astronomy"
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1.5">
                  Language (BCP-47)
                </label>
                <select
                  value={localLanguage}
                  onChange={(e) => setLocalLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-parchment-100 border border-wood/30 text-ink focus:outline-none focus:ring-2 focus:ring-brass-dark"
                >
                  <option value="">Any Language</option>
                  <option value="en">English (en)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="fr">French (fr)</option>
                  <option value="de">German (de)</option>
                  <option value="it">Italian (it)</option>
                  <option value="la">Latin (la)</option>
                  <option value="sa">Sanskrit (sa)</option>
                  <option value="ja">Japanese (ja)</option>
                </select>
              </div>

              <Input
                label="Publisher"
                value={localPublisher}
                onChange={(e) => setLocalPublisher(e.target.value)}
                placeholder="e.g. Oxford, Penguin"
              />

              <Input
                label="ISBN"
                value={localIsbn}
                onChange={(e) => setLocalIsbn(e.target.value)}
                placeholder="e.g. 9780140449136"
              />

              <Input
                label="Published After (Year)"
                value={localYearFrom}
                onChange={(e) => setLocalYearFrom(e.target.value)}
                placeholder="e.g. 1920"
                maxLength={4}
              />

              <Input
                label="Published Before (Year)"
                value={localYearTo}
                onChange={(e) => setLocalYearTo(e.target.value)}
                placeholder="e.g. 2024"
                maxLength={4}
              />

              <div className="flex items-end">
                <Button
                  variant="brass"
                  type="button"
                  onClick={() => applyFilters()}
                  className="w-full py-2.5 font-bold shadow"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED SLOW LOADING STATE (When querying external fallback networks) */}
      {isFetching && (
        <div className="p-4 mb-6 bg-amber-50 rounded-2xl border border-brass-antique/40 flex items-center justify-center gap-3 text-xs text-ink-dark shadow-sm animate-pulse">
          <Globe className="w-5 h-5 text-brass-dark animate-spin" />
          <span className="font-serif">
            Consulting external archival networks (Google Books & Open Library)… This may take a moment.
          </span>
        </div>
      )}

      {/* ERROR STATE */}
      {isError && (
        <ErrorFallback
          title="Archive Stacks Currently Unavailable"
          message={(error as any)?.message || 'We could not reach the book catalog database.'}
          onRetry={() => refetch()}
        />
      )}

      {/* RESULTS DISPLAY */}
      {!isError && books.length > 0 && (
        <div className="flex-1 flex flex-col justify-between">
          {/* 1. SHELF VIEW: Books standing as spines on wooden shelves */}
          {viewMode === 'shelf' && (
            <div className="space-y-8 my-4">
              {/* Wooden Bookcase Shelf Unit */}
              <div className="bg-wood-dark p-6 rounded-2xl border-4 border-wood-deep shadow-2xl">
                {/* Upper Shelf Lip */}
                <div className="w-full h-3 bg-wood-light/40 rounded-t mb-2 border-b border-black/20" />

                {/* Spines Standing on Wooden Shelf */}
                <div className="flex flex-wrap items-end gap-3 pb-2 pt-4 px-2 min-h-[300px] border-b-8 border-wood-deep">
                  {books.map((book) => (
                    <BookCard3D
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      authors={book.authors}
                      coverUrl={book.coverUrl}
                      rating={book.rating}
                      reviewCount={book.reviewCount}
                      inStore={book.inStore}
                      variant="spine"
                      onClick={() => navigate(`/books/${book.id}`)}
                    />
                  ))}
                </div>

                {/* Wooden Shelf Plaque */}
                <div className="w-full h-4 bg-wood-deep rounded-b flex items-center justify-center">
                  <div className="w-24 h-2 bg-brass-dark rounded-xs" />
                </div>
              </div>
            </div>
          )}

          {/* 2. GRID VIEW: 3D Tilt Cards */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 my-4">
              {books.map((book) => (
                <BookCard3D
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  authors={book.authors}
                  coverUrl={book.coverUrl}
                  rating={book.rating}
                  reviewCount={book.reviewCount}
                  inStore={book.inStore}
                  variant="card"
                  onClick={() => navigate(`/books/${book.id}`)}
                />
              ))}
            </div>
          )}

          {/* 3. COVERFLOW VIEW: 3D Rotating Carousel */}
          {viewMode === 'coverflow' && (
            <div className="my-6">
              <Coverflow3D
                books={books}
                onSelectBook={(b) => navigate(`/books/${b.id}`)}
              />
            </div>
          )}

          {/* LIBRARY LADDER PAGINATION */}
          <div className="mt-12 pt-6 border-t-2 border-wood/20 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs text-ink-light">
              <span>Volumes per shelf:</span>
              {[12, 20, 40, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSizeAndReset(size)}
                  className={clsx(
                    'px-2 py-1 rounded font-bold transition-colors',
                    pageSize === size
                      ? 'bg-wood-dark text-parchment-50'
                      : 'hover:bg-wood/10 text-ink-dark'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Sliding Ladder Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Shelf</span>
              </Button>

              <span className="font-serif font-bold text-xs text-ink-dark px-3 py-1 bg-parchment-50 rounded-lg border border-wood/30 shadow-inner">
                Shelf {page} {totalPages > 0 ? `of ${totalPages}` : ''}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={!data?.next}
                onClick={() => goToPage(page + 1)}
                className="gap-1 text-xs"
              >
                <span>Next Shelf</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="p-12 text-center bg-parchment-50 rounded-3xl border-2 border-wood/25 shadow-parchment max-w-lg mx-auto my-12 parchment-texture">
          <div className="w-16 h-16 rounded-2xl bg-wood/15 text-wood-dark flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink-dark mb-2">No Matching Folios Found</h3>
          <p className="text-xs text-ink-light leading-relaxed mb-6 font-serif">
            We searched both the local Akashic archives and connected global bibliographical sources, but no records matched these filters.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={resetFilters}>
              Reset Filters
            </Button>
            {user && (
              <Link to="/import">
                <Button variant="brass" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Import via Google or Open Library ID</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
