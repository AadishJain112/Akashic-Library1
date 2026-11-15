import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '../../api/recommendations';
import { fromRecBook } from '../../api/adapters';
import { Coverflow3D } from '../../components/css3d/Coverflow3D';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Info, RefreshCw } from 'lucide-react';

export const PicksPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['personal-recommendations', page],
    queryFn: () => recommendationsApi.getPersonalRecommendations(page, pageSize),
  });

  const rawRecs = data?.results || [];
  const recBooks = rawRecs.map(fromRecBook);
  const hasMore = rawRecs.length === pageSize;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            Curated For You
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Librarian's Picks</span>
            <Sparkles className="w-6 h-6 text-brass-dark" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Illuminated recommendations curated based on your reading affinities, subjects, and authors.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-2 shrink-0">
          <RefreshCw className={isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
          <span>Refresh Picks</span>
        </Button>
      </div>

      {/* Explanatory Advisory Plaque */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-brass-antique/40 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-serif">
          The Chief Librarian observes your shelved manuscripts, completed readings, and marked favorites. As your personal repository grows, your personalized recommendations become ever more refined.
        </p>
      </div>

      {/* 3D ROTATING READING WHEEL / COVERFLOW HERO */}
      {recBooks.length > 0 && (
        <section className="bg-parchment-200/40 p-6 rounded-3xl border border-wood/20">
          <h3 className="font-serif font-bold text-lg text-ink-dark mb-2 text-center">
            Featured Rotating Selection
          </h3>
          <Coverflow3D
            books={recBooks.slice(0, 8)}
            onSelectBook={(b) => navigate(`/books/${b.id}`)}
          />
        </section>
      )}

      {/* REASON-RIBBONED BOOK GRID */}
      {recBooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {recBooks.map((book) => (
            <div key={book.id} onClick={() => navigate(`/books/${book.id}`)}>
              <BookCard3D
                id={book.id}
                title={book.title}
                authors={book.authors}
                coverUrl={book.coverUrl}
                recommendationReason={book.recommendationReason}
                variant="card"
              />
            </div>
          ))}
        </div>
      )}

      {/* LOAD MORE CONTROL */}
      {hasMore && (
        <div className="text-center pt-8">
          <Button
            variant="brass"
            onClick={() => setPage(page + 1)}
            isLoading={isFetching}
            className="gap-2 shadow"
          >
            <span>Consult Further Recommendations</span>
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && recBooks.length === 0 && (
        <div className="p-12 text-center bg-parchment-50 rounded-3xl border border-wood/20 max-w-md mx-auto my-12">
          <Compass className="w-12 h-12 text-wood/60 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-xl text-ink-dark">Picks Are Being Prepared</h3>
          <p className="text-xs text-ink-light mt-1 mb-4 font-serif">
            Place volumes on your shelves or mark favorites to spark algorithmic insights!
          </p>
          <Button variant="brass" onClick={() => navigate('/catalogue')}>
            Browse Catalogue
          </Button>
        </div>
      )}
    </div>
  );
};
