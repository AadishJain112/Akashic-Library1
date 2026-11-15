import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { formatPrice, formatDate } from '../../api/adapters';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { ParcelScene3D } from '../../components/three/ParcelScene3D';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorFallback } from '../../components/ui/ErrorFallback';
import {
  Package,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  FileText,
  Printer,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id || '';
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrderDetail(orderId),
    enabled: Boolean(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center animate-pulse">
        <div className="w-56 h-48 bg-wood/15 rounded-3xl mb-4" />
        <div className="w-full h-96 bg-wood/10 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <ErrorFallback
        title="Parcel Record Not Found"
        message={(error as any)?.message || 'This order could not be retrieved from the ledger.'}
        onRetry={() => navigate('/parcels')}
      />
    );
  }

  const items = order.items || [];

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link
          to="/parcels"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-wood-dark hover:text-ink-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parcel Shelves</span>
        </Link>
      </div>

      {/* 3D Parcel Box Canvas */}
      <div className="w-full h-48 flex items-center justify-center">
        <div className="w-64 h-full">
          <CanvasContainer camera={{ position: [0, 1.2, 3], fov: 40 }}>
            <ParcelScene3D
              status={order.status}
              paymentStatus={order.payment_status}
            />
          </CanvasContainer>
        </div>
      </div>

      {/* PARCHMENT INVOICE RECEIPT */}
      <div className="bg-parchment-50 p-8 sm:p-10 rounded-3xl border-2 border-brass-antique/50 shadow-2xl parchment-texture space-y-6">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-wood/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brass-dark">
              Official Archival Receipt
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-ink-dark mt-0.5">
              Parcel #{order.id.slice(0, 8)}
            </h1>
            <p className="text-xs text-ink-light font-mono mt-0.5">
              Order ID: {order.id}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant={order.status === 'CONFIRMED' ? 'emerald' : 'amber'}>
                {order.status}
              </Badge>
              <Badge variant={order.payment_status === 'PAID' ? 'emerald' : 'amber'}>
                {order.payment_status} (Simulated)
              </Badge>
            </div>
            <span className="text-xs text-ink-light flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-wood-dark" />
              <span>{formatDate(order.created_at)}</span>
            </span>
          </div>
        </div>

        {/* Snapshot Line Items (Per Section 9.14: line items from snapshot, handle product_id: null) */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-sm text-ink-dark uppercase tracking-wider">
            Inscribed Line Items
          </h3>

          <div className="divide-y divide-wood/15">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between text-xs font-serif"
              >
                <div className="pr-4">
                  <span className="font-bold text-sm text-ink-dark block">
                    {item.quantity} × {item.title}
                  </span>
                  <span className="text-[11px] text-ink-light italic">
                    Unit Price: {formatPrice(item.price)}
                  </span>
                </div>
                <span className="font-sans font-bold text-sm text-ink-dark">
                  {formatPrice(item.line_total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="pt-4 border-t-2 border-wood/20 space-y-1.5 text-sm">
          <div className="flex justify-between text-xs text-ink-light">
            <span>Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink-light">
            <span>Packaging & Dispatch:</span>
            <span className="font-semibold text-jewel-emerald">Complimentary</span>
          </div>
          <div className="flex justify-between font-serif font-extrabold text-xl text-ink-dark pt-3 border-t border-wood/15">
            <span>Total Inscribed:</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Receipt Footer with Print & Return */}
        <div className="pt-6 border-t border-wood/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <p className="text-ink-light italic font-serif">
            Thank you for supporting the preservation and circulation of manuscripts.
          </p>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
