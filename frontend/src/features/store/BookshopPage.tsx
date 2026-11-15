import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeApi, ProductStatus } from '../../api/store';
import { useBooks } from '../../hooks/useBooks';
import { formatPrice } from '../../api/adapters';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const BookshopPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const pageSize = 18;
  const navigate = useNavigate();

  // Load store products
  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store-products', page, pageSize],
    queryFn: () => storeApi.getProducts(page, pageSize),
  });

  const rawProducts = storeData?.results || [];

  // Batch load book metadata for all products
  const bookReferences = rawProducts.map((p) => p.book_reference);
  const { data: booksMap = {} } = useBooks(bookReferences);

  // Status Badge Mapper
  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="emerald">In Stock</Badge>;
      case 'LOW_STOCK':
        return <Badge variant="amber">Only a few left</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge variant="neutral">Out of Stock</Badge>;
      case 'PREORDER':
        return <Badge variant="violet">Pre-order</Badge>;
      default:
        return null;
    }
  };

  // Join products with book info
  const enrichedProducts = rawProducts.map((p) => {
    const book = booksMap[p.book_reference];
    return {
      ...p,
      title: book?.title || 'Catalogued Volume',
      authors: book?.authors || [],
      coverUrl: book?.covers?.[0] || null,
    };
  });

  // Client-side filtering & sorting
  const filteredProducts = enrichedProducts
    .filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (filterText) {
        const query = filterText.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesAuthor = p.authors.some((a) => a.toLowerCase().includes(query));
        const matchesEdition = p.edition.toLowerCase().includes(query);
        return matchesTitle || matchesAuthor || matchesEdition;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalCount = storeData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            Physical Emporium
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Bookshop</span>
            <ShoppingBag className="w-7 h-7 text-wood-dark" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Rare hardcovers, archival first editions, and preserved prints available for acquisition.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-light absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search store editions…"
              className="pl-9 pr-3 py-1.5 text-xs bg-parchment-50 border border-wood/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-parchment-50 border border-wood/30 rounded-xl px-2.5 py-1.5 text-ink-dark font-medium"
          >
            <option value="ALL">All Availabilities</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="PREORDER">Pre-order</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-parchment-50 border border-wood/30 rounded-xl px-2.5 py-1.5 text-ink-dark font-medium"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Modest to Rare</option>
            <option value="price_desc">Price: Rare to Modest</option>
          </select>
        </div>
      </div>

      {/* 3D BOOKSHOP DISPLAY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/bookshop/${product.id}`)}
            className="group p-3.5 bg-parchment-50 rounded-2xl border-2 border-wood/20 shadow-sm hover:shadow-lg hover:border-brass transition-all cursor-pointer flex flex-col justify-between parchment-texture"
          >
            {/* 3D Book Cover */}
            <div className="mb-3">
              <BookCard3D
                id={product.book_reference}
                title={product.title}
                authors={product.authors}
                coverUrl={product.coverUrl}
                variant="card"
              />
            </div>

            {/* Product Details & Brass Price Tag */}
            <div className="pt-2 border-t border-wood/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-light truncate max-w-[120px]">
                  {product.edition}
                </span>
                {getStatusBadge(product.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink-light uppercase">
                  {product.condition}
                </span>
                {/* Brass Price Tag Badge */}
                <div className="px-2 py-0.5 rounded-md bg-brass-light/40 border border-brass-antique/50 font-serif font-black text-sm text-ink-dark shadow-xs">
                  {formatPrice(product.price)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-wood/20">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <span className="text-xs font-serif font-bold text-ink-dark px-3 py-1 bg-parchment-50 rounded-lg border border-wood/25">
            Table {page} of {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-parchment-50 rounded-3xl border border-wood/20 max-w-md mx-auto my-12 parchment-texture">
          <ShoppingBag className="w-12 h-12 text-wood/60 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-xl text-ink-dark">No Products Matched</h3>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Try resetting your availability filter or search terms.
          </p>
        </div>
      )}
    </div>
  );
};
