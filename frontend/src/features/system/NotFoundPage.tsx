import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Search, Compass, BookX } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-parchment-50 border-2 border-wood/30 rounded-3xl p-8 text-center shadow-parchment-lg parchment-texture">
        {/* Empty Shelf Gap Graphic */}
        <div className="w-20 h-20 rounded-2xl bg-parchment-200 border-2 border-wood/40 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <BookX className="w-10 h-10 text-wood-dark" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
          Folio Missing · Error 404
        </span>
        <h2 className="font-serif text-3xl font-extrabold text-ink-dark mt-2 mb-3">
          This Volume Has Been Misplaced
        </h2>
        <p className="text-sm text-ink-light leading-relaxed mb-6 font-serif">
          The requested shelf location is currently vacant. Perhaps the book has been borrowed by another reader, recataloged, or moved to a different wing of the library.
        </p>

        {/* Search Stacks Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalogue by title, author, subject…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-parchment-100 border border-wood/30 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brass-dark"
          />
          <Button variant="brass" type="submit" className="gap-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Button>
        </form>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Return to Previous Room
          </Button>
          <Link to="/">
            <Button variant="primary" className="gap-2">
              <Compass className="w-4 h-4" />
              <span>Grand Hall</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
