import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, CartItem } from '../../api/cart';
import { useBooks } from '../../hooks/useBooks';
import { formatPrice } from '../../api/adapters';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { TrolleyScene3D } from '../../components/three/TrolleyScene3D';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Load Cart
  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const items = cart?.items || [];

  // Batch load book titles & covers for cart items
  const bookReferences = items.map((it) => it.book_reference);
  const { data: booksMap = {} } = useBooks(bookReferences);

  // MUTATION: Update Quantity
  const updateQtyMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItemQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not update quantity.');
    },
  });

  // MUTATION: Remove Item
  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      success('Item removed from book trolley.', 'Trolley Updated');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to remove item.');
    },
  });

  // Check if any items have stock violations
  const hasStockError = items.some(
    (item) => item.quantity > item.available_quantity || item.available_quantity <= 0
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            Reserved Acquisitions
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Book Trolley</span>
            <ShoppingBag className="w-7 h-7 text-wood-dark" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Physical editions currently gathered in your personal rolling trolley.
          </p>
        </div>

        {items.length > 0 && (
          <Link to="/bookshop">
            <Button variant="secondary" size="sm">
              Continue Browsing Bookshop
            </Button>
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 3D BOOK TROLLEY STAGE */}
          <div className="lg:col-span-5 bg-parchment-50 p-6 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture flex flex-col items-center">
            <h3 className="font-serif font-bold text-sm text-ink-dark mb-2 uppercase tracking-wider">
              Trolley Bay
            </h3>
            <div className="w-full h-72">
              <CanvasContainer camera={{ position: [0, 1.2, 3.8], fov: 40 }}>
                <TrolleyScene3D itemCount={items.length} />
              </CanvasContainer>
            </div>
            <p className="text-[11px] text-ink-light italic text-center mt-2">
              Holding {items.length} unique {items.length === 1 ? 'title' : 'titles'} for checkout
            </p>
          </div>

          {/* RIGHT: CART ROWS & CHECKOUT CARD */}
          <div className="lg:col-span-7 space-y-4">
            {/* Items List */}
            <div className="space-y-3">
              {items.map((item) => {
                const book = booksMap[item.book_reference];
                const isOverStock = item.quantity > item.available_quantity;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-parchment-50 rounded-2xl border border-wood/20 shadow-xs parchment-texture flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Book Thumbnail & Info */}
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className="w-14 h-20 bg-wood/20 rounded-lg overflow-hidden border border-wood/30 shadow shrink-0">
                        {book?.covers?.[0] ? (
                          <img
                            src={book.covers[0]}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-wood-dark text-brass font-bold text-xs">
                            AK
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <Link
                          to={`/books/${item.book_reference}`}
                          className="font-serif font-bold text-sm text-ink-dark hover:text-wood-dark transition-colors line-clamp-1"
                        >
                          {book?.title || 'Preserved Print Edition'}
                        </Link>
                        <p className="text-xs text-ink-light mt-0.5">
                          {item.edition} · {item.condition}
                        </p>
                        <p className="text-xs font-bold text-jewel-emerald mt-1">
                          {formatPrice(item.current_price)} each
                        </p>

                        {/* Stock warning if over available */}
                        {isOverStock && (
                          <p className="text-[11px] text-jewel-ruby font-bold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Only {item.available_quantity} copies left in archives!</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stepper & Line Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-wood/15">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-parchment-100 border border-wood/30 rounded-xl p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() =>
                            updateQtyMutation.mutate({
                              itemId: item.id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          disabled={item.quantity <= 1 || updateQtyMutation.isPending}
                          className="p-1 rounded hover:bg-parchment-200 text-ink-dark disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-ink-dark">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQtyMutation.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          disabled={
                            item.quantity >= item.available_quantity ||
                            updateQtyMutation.isPending
                          }
                          className="p-1 rounded hover:bg-parchment-200 text-ink-dark disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <span className="font-serif font-black text-base text-ink-dark min-w-[70px] text-right">
                        {formatPrice(item.line_subtotal)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeMutation.mutate(item.id)}
                        className="p-2 text-ink-light hover:text-jewel-ruby hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove from trolley"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUB-TOTAL & PROCEED CARD */}
            <div className="p-6 bg-parchment-50 rounded-2xl border-2 border-brass-antique/50 shadow-parchment parchment-texture space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-light font-serif">Subtotal:</span>
                <span className="font-serif font-extrabold text-2xl text-ink-dark">
                  {formatPrice(cart?.cart_subtotal)}
                </span>
              </div>

              {hasStockError && (
                <div className="p-3 bg-rose-50 border border-jewel-ruby/30 rounded-xl text-xs text-jewel-ruby flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Please adjust item quantities to available stock before proceeding.</span>
                </div>
              )}

              <Button
                variant="brass"
                disabled={hasStockError}
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 font-bold text-sm shadow-md gap-2"
              >
                <span>Proceed to Parcel Desk (Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Trolley State */
        <div className="p-16 text-center bg-parchment-50 rounded-3xl border-2 border-wood/25 shadow-parchment max-w-md mx-auto my-12 parchment-texture">
          <ShoppingBag className="w-16 h-16 text-wood/60 mx-auto mb-4" />
          <h3 className="font-serif font-bold text-2xl text-ink-dark mb-1">
            Your Book Trolley is Empty
          </h3>
          <p className="text-xs text-ink-light mt-1 mb-6 font-serif leading-relaxed">
            Visit the Bookshop to collect physical volumes, rare prints, and catalogued editions.
          </p>
          <Link to="/bookshop">
            <Button variant="brass" className="gap-2 shadow">
              <span>Browse The Bookshop</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
