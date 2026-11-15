import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../../api/cart';
import { ordersApi, Order } from '../../api/orders';
import { useBooks } from '../../hooks/useBooks';
import { formatPrice } from '../../api/adapters';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { ParcelScene3D } from '../../components/three/ParcelScene3D';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Package,
  Info,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { error: toastError } = useToast();
  const navigate = useNavigate();

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isWrapping, setIsWrapping] = useState(false);

  // Load current Cart
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const items = cart?.items || [];
  const bookReferences = items.map((it) => it.book_reference);
  const { data: booksMap = {} } = useBooks(bookReferences);

  // Mutation: Checkout
  const checkoutMutation = useMutation({
    mutationFn: () => ordersApi.checkout(),
    onMutate: () => {
      setIsWrapping(true);
    },
    onSuccess: (order) => {
      // Trigger festive paper celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E6BC5C', '#1F8A70', '#C2334D', '#D9A566'],
        });
      } catch {}

      setTimeout(() => {
        setIsWrapping(false);
        setConfirmedOrder(order);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }, 1200);
    },
    onError: (err: any) => {
      setIsWrapping(false);
      toastError(err?.message || 'Could not complete checkout. Please review cart stock.');
    },
  });

  // CONFIRMED ORDER RECEIPT VIEW
  if (confirmedOrder) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 flex flex-col items-center">
        {/* 3D Wrapped Parcel Box */}
        <div className="w-64 h-52 mb-4">
          <CanvasContainer camera={{ position: [0, 1.2, 3.2], fov: 40 }}>
            <ParcelScene3D status="CONFIRMED" paymentStatus="PAID" />
          </CanvasContainer>
        </div>

        <div className="w-full bg-parchment-50 p-8 rounded-3xl border-2 border-brass-antique/50 shadow-2xl parchment-texture text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-jewel-emerald" />
            <span>Parcel Sealed & Dispatched to Ledger</span>
          </div>

          <div>
            <h1 className="font-serif text-3xl font-extrabold text-ink-dark">
              Order Confirmed #{confirmedOrder.id.slice(0, 8)}
            </h1>
            <p className="text-xs text-ink-light mt-1 font-mono">
              Universal Record ID: {confirmedOrder.id}
            </p>
          </div>

          <div className="p-4 bg-parchment-100 rounded-2xl border border-wood/20 text-xs space-y-2 text-left">
            <div className="flex justify-between font-bold text-ink-dark">
              <span>Status:</span>
              <span className="text-jewel-emerald">{confirmedOrder.status}</span>
            </div>
            <div className="flex justify-between font-bold text-ink-dark">
              <span>Payment:</span>
              <span className="text-jewel-emerald">{confirmedOrder.payment_status} (Simulated)</span>
            </div>
            <div className="flex justify-between font-bold text-ink-dark border-t border-wood/15 pt-2">
              <span>Order Total:</span>
              <span className="font-serif text-base text-ink-dark">{formatPrice(confirmedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-wood/20">
            <Link to={`/parcels/${confirmedOrder.id}`}>
              <Button variant="brass" className="gap-2 shadow">
                <Package className="w-4 h-4" />
                <span>View Parcel Invoice Receipt</span>
              </Button>
            </Link>
            <Link to="/catalogue">
              <Button variant="secondary" className="gap-2">
                <BookOpen className="w-4 h-4 text-wood-dark" />
                <span>Return to The Stacks</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="text-center max-w-lg mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
          Archival Dispatch Desk
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center justify-center gap-2">
          <span>The Parcel Desk</span>
          <Package className="w-7 h-7 text-wood-dark" />
        </h1>
        <p className="text-xs text-ink-light mt-1 font-serif">
          Review your items and confirm dispatch packaging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT: 3D PARCEL STAGE */}
        <div className="md:col-span-5 bg-parchment-50 p-6 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture flex flex-col items-center">
          <h3 className="font-serif font-bold text-sm text-ink-dark mb-2 uppercase tracking-wider">
            Packaging Station
          </h3>
          <div className="w-full h-64">
            <CanvasContainer camera={{ position: [0, 1.2, 3.2], fov: 40 }}>
              <ParcelScene3D isWrapping={isWrapping} />
            </CanvasContainer>
          </div>
          <p className="text-[11px] text-ink-light italic text-center mt-2 font-serif">
            Kraft paper packaging with hemp twine and archival wax seal
          </p>
        </div>

        {/* RIGHT: SUMMARY & CONFIRM BUTTON */}
        <div className="md:col-span-7 bg-parchment-50 p-6 md:p-8 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture space-y-6">
          {/* Simulated Payment Notice Banner (Mandatory per spec) */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-brass-antique/40 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-serif font-bold text-sm mb-0.5">
                Simulated Payment System
              </strong>
              <p className="font-serif leading-relaxed">
                Akashic Library operates on an archival simulation protocol. No credit cards, billing addresses, or bank accounts are required. Confirming will instantly convert your cart into a sealed order.
              </p>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="space-y-2 border-y border-wood/20 py-4">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-light mb-2">
              Volumes In Parcel ({items.length})
            </h4>
            {items.map((it) => {
              const book = booksMap[it.book_reference];
              return (
                <div key={it.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-4">
                    <span className="font-bold text-ink-dark line-clamp-1">
                      {it.quantity} × {book?.title || 'Volume'}
                    </span>
                    <span className="text-[10px] text-ink-light block">
                      {it.edition} · {it.condition}
                    </span>
                  </div>
                  <span className="font-serif font-bold text-ink-dark shrink-0">
                    {formatPrice(it.line_subtotal)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Subtotal & Total */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-ink-light">
              <span>Item Subtotal:</span>
              <span className="font-bold">{formatPrice(cart?.cart_subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-light">
              <span>Archival Packaging:</span>
              <span className="font-bold text-jewel-emerald">Complimentary</span>
            </div>
            <div className="flex justify-between font-serif font-extrabold text-xl text-ink-dark pt-2 border-t border-wood/20">
              <span>Final Total:</span>
              <span>{formatPrice(cart?.cart_subtotal)}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            variant="brass"
            onClick={() => checkoutMutation.mutate()}
            isLoading={checkoutMutation.isPending || isWrapping}
            disabled={items.length === 0}
            className="w-full py-4 font-bold text-base shadow-lg gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Confirm Order & Seal Parcel</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
