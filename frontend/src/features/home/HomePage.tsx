import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../../api/books';
import { storeApi } from '../../api/store';
import { communityApi } from '../../api/community';
import { fromBookListItem, formatPrice, formatDate } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useCartCount } from '../../hooks/useCartCount';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { GrandHallScene } from '../../components/three/GrandHallScene';
import { Coverflow3D } from '../../components/css3d/Coverflow3D';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Button } from '../../components/ui/Button';
import {
  Search,
  BookOpen,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { count: cartCount } = useCartCount();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  // 1. Fresh on the Shelves
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['home-books'],
    queryFn: () => booksApi.searchBooks({ page: 1, page_size: 12 }),
  });

  // 2. From the Bookshop
  const { data: storeData } = useQuery({
    queryKey: ['home-store'],
    queryFn: () => storeApi.getProducts(1, 6),
  });

  // 3. Latest in the Reading Circle
  const { data: discussionsData } = useQuery({
    queryKey: ['home-discussions'],
    queryFn: () => communityApi.getDiscussions({ limit: 4 }),
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const freshBooks = (booksData?.results || []).map(fromBookListItem);

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO: GRAND READING HALL WITH 3D ORBITING BOOKS */}
      <section className="relative h-[560px] md:h-[640px] w-full overflow-hidden flex items-center justify-center select-none">
        {/* Background 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <CanvasContainer camera={{ position: [0, 1.2, 5], fov: 45 }}>
            <GrandHallScene />
          </CanvasContainer>
        </div>

        {/* Foreground Content & Search Drawer */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wood-dark/80 text-parchment-200 border border-brass-antique/60 text-xs font-semibold backdrop-blur-sm mb-4 shadow">
            <Sparkles className="w-3.5 h-3.5 text-brass" />
            <span>Discover. Read. Connect. Shop.</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-ink-dark leading-tight tracking-wide drop-shadow-sm">
            Step Into The <br />
            <span className="text-wood-dark underline decoration-brass/60 underline-offset-8">
              Akashic Reading Hall
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-ink font-serif max-w-xl mx-auto leading-relaxed">
            A sanctuary where centuries of manuscript history meet living scholarly community. Search the world's universal repository or explore rare physical prints.
          </p>

          {/* Hero Catalogue-Drawer Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-lg mx-auto flex items-center bg-parchment-50 p-2 rounded-2xl border-2 border-brass-dark/70 shadow-2xl backdrop-blur-sm"
          >
            <Search className="w-5 h-5 text-wood-dark ml-2.5 mr-2 shrink-0" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search books by title, author, or subject…"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-light/60 focus:outline-none px-2"
            />
            <Button variant="brass" type="submit" size="sm" className="font-bold shrink-0">
              Consult Stacks
            </Button>
          </form>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/catalogue">
              <Button variant="primary" className="gap-2 shadow">
                <BookOpen className="w-4 h-4" />
                <span>Browse The Stacks</span>
              </Button>
            </Link>
            {!user ? (
              <Link to="/register">
                <Button variant="secondary" className="gap-2 shadow">
                  <Sparkles className="w-4 h-4 text-brass-dark" />
                  <span>Get Your Library Card</span>
                </Button>
              </Link>
            ) : (
              <Link to="/shelves">
                <Button variant="secondary" className="gap-2 shadow">
                  <BookOpen className="w-4 h-4 text-wood-dark" />
                  <span>Open My Shelves</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* PERSONAL READER STRIP (Logged-in users only) */}
      {user && (
        <div className="bg-wood-dark/95 border-y-2 border-brass-antique/40 py-3.5 px-4 text-parchment-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-jewel-emerald animate-pulse" />
              <span>Welcome back, <strong className="font-serif text-brass-light">{user.display_name || user.username}</strong></span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/shelves" className="hover:text-brass-light transition-colors flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-brass" />
                <span>My Shelves</span>
              </Link>
              <Link to="/picks" className="hover:text-brass-light transition-colors flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                <span>Personal Picks</span>
              </Link>
              <Link to="/trolley" className="hover:text-brass-light transition-colors flex items-center gap-1.5 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-brass" />
                <span>Trolley ({cartCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE LIBRARY WINGS (3D Tilt Room Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            The Chambers of Knowledge
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1">
            Walk Through The Library Wings
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Room 1: The Stacks */}
          <Link
            to="/catalogue"
            className="group p-6 bg-parchment-50 rounded-2xl border border-wood/25 shadow-parchment hover:shadow-parchment-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between parchment-texture"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-wood/15 text-wood-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink-dark group-hover:text-wood-dark transition-colors">
                The Stacks
              </h3>
              <p className="text-xs text-ink-light mt-2 leading-relaxed">
                Millions of manuscripts indexed from global repositories with spine-wall previews.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-wood-dark group-hover:text-ink-dark">
              <span>Enter Stacks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Room 2: The Bookshop */}
          <Link
            to="/bookshop"
            className="group p-6 bg-parchment-50 rounded-2xl border border-wood/25 shadow-parchment hover:shadow-parchment-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between parchment-texture"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-brass/20 text-wood-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink-dark group-hover:text-wood-dark transition-colors">
                The Bookshop
              </h3>
              <p className="text-xs text-ink-light mt-2 leading-relaxed">
                Browse physical editions, inspect binding conditions, and parcel up reading treasures.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-wood-dark group-hover:text-ink-dark">
              <span>Browse Volumes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Room 3: Reading Circle */}
          <Link
            to="/circle"
            className="group p-6 bg-parchment-50 rounded-2xl border border-wood/25 shadow-parchment hover:shadow-parchment-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between parchment-texture"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-jewel-amethyst/15 text-jewel-amethyst flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink-dark group-hover:text-jewel-amethyst transition-colors">
                The Reading Circle
              </h3>
              <p className="text-xs text-ink-light mt-2 leading-relaxed">
                Scholarly dialogues, book clubs, and parchment scroll inquiries shared among readers.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-jewel-amethyst group-hover:text-ink-dark">
              <span>Join Circle</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Room 4: Personal Shelves */}
          <Link
            to={user ? '/shelves' : '/login'}
            className="group p-6 bg-parchment-50 rounded-2xl border border-wood/25 shadow-parchment hover:shadow-parchment-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between parchment-texture"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-jewel-emerald/15 text-jewel-emerald flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-ink-dark group-hover:text-jewel-emerald transition-colors">
                Personal Library
              </h3>
              <p className="text-xs text-ink-light mt-2 leading-relaxed">
                Organise reading journeys onto Want to Read, Reading, and Read shelves with favorites.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-jewel-emerald group-hover:text-ink-dark">
              <span>View Shelves</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FRESH ON THE SHELVES (3D Coverflow Carousel) */}
      <section className="bg-parchment-200/50 py-16 border-y border-wood/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
                Acquisitions Spotlight
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-ink-dark mt-1">
                Fresh on the Shelves
              </h2>
            </div>
            <Link
              to="/catalogue"
              className="text-xs font-bold text-wood-dark hover:text-ink-dark flex items-center gap-1 transition-colors"
            >
              <span>Explore All Stacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {freshBooks.length > 0 ? (
            <Coverflow3D
              books={freshBooks}
              onSelectBook={(b) => navigate(`/books/${b.id}`)}
            />
          ) : (
            <div className="text-center py-16 p-8 bg-parchment-50 rounded-2xl border border-wood/20 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-wood/60 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-ink-dark">The Shelves Are Being Stocked</h3>
              <p className="text-xs text-ink-light mt-1 mb-4 font-serif">
                Our librarians are currently cataloguing fresh acquisitions from worldwide archives.
              </p>
              <Link to="/catalogue">
                <Button variant="brass" size="sm">Search General Catalogue</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. FROM THE BOOKSHOP TEASER */}
      {storeData && storeData.results && storeData.results.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
                Available In Store
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-ink-dark mt-1">
                From The Bookshop
              </h2>
            </div>
            <Link
              to="/bookshop"
              className="text-xs font-bold text-wood-dark hover:text-ink-dark flex items-center gap-1"
            >
              <span>View Bookshop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {storeData.results.map((product) => (
              <Link
                key={product.id}
                to={`/bookshop/${product.id}`}
                className="group p-3 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm hover:shadow hover:border-wood/40 transition-all flex flex-col justify-between"
              >
                <div className="aspect-[2/3] bg-wood/20 rounded-lg flex items-center justify-center p-2 text-center border border-wood/20 mb-3 shadow-inner">
                  <div className="flex flex-col items-center">
                    <BookOpen className="w-8 h-8 text-wood-dark opacity-75 mb-1" />
                    <span className="text-[10px] font-bold text-ink-light line-clamp-2">
                      {product.edition || 'Collector Edition'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-ink-light font-medium">{product.condition}</span>
                    <span className="font-bold text-jewel-emerald">{formatPrice(product.price)}</span>
                  </div>
                  <span className="text-[10px] block text-center font-bold uppercase tracking-wider py-1 bg-brass-light/30 rounded text-ink-dark group-hover:bg-brass transition-colors">
                    View Volume
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. LATEST IN THE READING CIRCLE */}
      {discussionsData && discussionsData.length > 0 && (
        <section className="bg-parchment-200/40 py-16 border-t border-wood/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-jewel-amethyst">
                  Live Scholarly Discourse
                </span>
                <h2 className="font-serif text-3xl font-extrabold text-ink-dark mt-1">
                  Latest In The Reading Circle
                </h2>
              </div>
              <Link
                to="/circle"
                className="text-xs font-bold text-jewel-amethyst hover:text-ink-dark flex items-center gap-1"
              >
                <span>Enter The Circle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discussionsData.map((d) => (
                <Link
                  key={d.id}
                  to={`/circle/${d.id}`}
                  className="p-5 bg-parchment-50 rounded-2xl border border-wood/20 shadow-sm hover:shadow hover:border-brass transition-all parchment-texture flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-jewel-amethyst/10 text-jewel-amethyst border border-jewel-amethyst/20">
                        {d.topic_type}
                      </span>
                      <span className="text-[11px] text-ink-light flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(d.created_at)}</span>
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-ink-dark group-hover:text-jewel-amethyst transition-colors line-clamp-1">
                      {d.title}
                    </h4>
                    <p className="text-xs text-ink-light line-clamp-2 mt-1.5 leading-relaxed font-serif">
                      {d.body}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-wood/15 flex items-center justify-between text-xs text-ink-light">
                    <span className="font-medium">Reader discussion</span>
                    <span className="text-jewel-amethyst font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Unroll Scroll</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
