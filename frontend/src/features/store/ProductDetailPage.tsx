import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '../../api/store';
import { useBook } from '../../hooks/useBooks';
import { cartApi } from '../../api/cart';
import { formatPrice } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const id = productId || '';
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Load product detail including live inventory
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => storeApi.getProductDetail(id),
    enabled: Boolean(id),
  });

  // Load joined book metadata
  const { data: book } = useBook(product?.book_reference);

  // Mutation: Add to Cart
  const addMutation = useMutation({
    mutationFn: () => cartApi.addItem(id, quantity),
    onSuccess: () => {
      success(
        `${quantity} × "${book?.title || 'Volume'}" placed into your Book Trolley!`,
        'Trolley Updated'
      );
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to place volume in trolley.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center animate-pulse">
        <div className="w-64 h-96 bg-wood/15 rounded-3xl mb-4" />
        <div className="h-8 bg-wood/25 rounded w-80" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <ErrorFallback
        title="Product Not Located In Bookshop"
        message={(error as any)?.message || 'This item could not be retrieved from the store.'}
        onRetry={() => navigate('/bookshop')}
      />
    );
  }

  const available = product.inventory?.available_quantity ?? 0;
  const isPurchasable = product.status !== 'OUT_OF_STOCK' && product.status !== 'DISCONTINUED' && available > 0;

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      <div>
        <Link
          to="/bookshop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-wood-dark hover:text-ink-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to The Bookshop</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-parchment-50 p-6 md:p-10 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture">
        {/* Large 3D Book Presentation */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-64 aspect-[2/3]">
            <BookCard3D
              id={product.book_reference}
              title={book?.title || 'Preserved Volume'}
              authors={book?.authors || []}
              coverUrl={book?.covers?.[0]}
              variant="card"
            />
          </div>
        </div>

        {/* Product Facts & Purchasing Controls */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brass">{product.edition}</Badge>
              <Badge variant={isPurchasable ? 'emerald' : 'ruby'}>{product.status}</Badge>
            </div>

            <h1 className="font-serif text-3xl font-extrabold text-ink-dark leading-tight">
              {book?.title || 'Physical Print Edition'}
            </h1>
            <p className="text-sm text-wood-dark font-serif italic mt-1">
              By {book?.authors.join(', ') || 'Unknown Author'}
            </p>

            <div className="mt-4 p-4 bg-parchment-100 rounded-2xl border border-wood/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-light">Physical Condition:</span>
                <span className="font-bold text-ink-dark">{product.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-light">Available in Stockroom:</span>
                <span className="font-bold text-ink-dark">{available} copies</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif font-black text-3xl text-ink-dark">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-ink-light">per individual print</span>
            </div>
          </div>

          {/* Purchasing Form */}
          {user ? (
            <div className="space-y-4 pt-4 border-t border-wood/20">
              {isPurchasable ? (
                <div className="flex items-center gap-4">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-parchment-100 border border-wood/30 rounded-xl p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 rounded-lg hover:bg-parchment-200 text-ink-dark disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-ink-dark">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(available, quantity + 1))}
                      disabled={quantity >= available}
                      className="p-1.5 rounded-lg hover:bg-parchment-200 text-ink-dark disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    variant="brass"
                    onClick={() => addMutation.mutate()}
                    isLoading={addMutation.isPending}
                    className="flex-1 py-3 text-sm font-bold shadow-md gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} to Book Trolley</span>
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-jewel-ruby/30 rounded-xl text-xs text-jewel-ruby font-medium text-center">
                  This volume is currently out of stock or reserved in archives.
                </div>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-wood/20">
              <Link to={`/login?redirect=/bookshop/${id}`}>
                <Button variant="brass" className="w-full py-3 shadow font-bold">
                  Log in to acquire this edition
                </Button>
              </Link>
            </div>
          )}

          {/* Link back to Book Detail */}
          <div className="pt-4 border-t border-wood/15">
            <Link
              to={`/books/${product.book_reference}`}
              className="text-xs font-serif font-bold text-wood-dark hover:underline flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-brass-dark" />
              <span>Examine full manuscript description, reviews & citations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
