import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, Order } from '../../api/orders';
import { formatPrice, formatDate } from '../../api/adapters';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { ParcelScene3D } from '../../components/three/ParcelScene3D';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

export const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const navigate = useNavigate();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () => ordersApi.getOrders(page, pageSize),
  });

  const orders = ordersData?.results || [];
  const totalCount = ordersData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="emerald">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="amber">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="ruby">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getPaymentStamp = (paymentStatus: Order['payment_status']) => {
    switch (paymentStatus) {
      case 'PAID':
        return <Badge variant="emerald">Paid (Simulated)</Badge>;
      case 'PENDING':
        return <Badge variant="amber">Payment Pending</Badge>;
      case 'FAILED':
        return <Badge variant="ruby">Payment Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            Archival Dispatch Ledger
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Parcel Desk Shelves</span>
            <Package className="w-7 h-7 text-wood-dark" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            A chronological record of packaged and dispatched physical volumes.
          </p>
        </div>

        <Link to="/bookshop">
          <Button variant="secondary" size="sm">
            Browse The Bookshop
          </Button>
        </Link>
      </div>

      {/* 3D PARCEL SHELVES GRID */}
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/parcels/${order.id}`)}
              className="p-5 bg-parchment-50 rounded-3xl border-2 border-wood/25 shadow-sm hover:shadow-lg hover:border-brass transition-all cursor-pointer parchment-texture flex flex-col justify-between group"
            >
              {/* Mini 3D Parcel Canvas */}
              <div className="w-full h-36 mb-2">
                <CanvasContainer camera={{ position: [0, 1.2, 3], fov: 40 }}>
                  <ParcelScene3D
                    status={order.status}
                    paymentStatus={order.payment_status}
                  />
                </CanvasContainer>
              </div>

              {/* Order Info & Status Stamps */}
              <div className="space-y-2 pt-2 border-t border-wood/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-ink-light">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-[11px] text-ink-light">
                    {formatDate(order.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {getStatusBadge(order.status)}
                  {getPaymentStamp(order.payment_status)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-wood/10">
                  <span className="text-xs text-ink-light">
                    {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-serif font-black text-base text-ink-dark">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-end text-xs font-bold text-wood-dark group-hover:text-ink-dark transition-colors gap-1">
                  <span>Examine Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty Orders State */
        <div className="p-16 text-center bg-parchment-50 rounded-3xl border border-wood/25 shadow-parchment max-w-md mx-auto my-12 parchment-texture">
          <Package className="w-16 h-16 text-wood/60 mx-auto mb-4" />
          <h3 className="font-serif font-bold text-2xl text-ink-dark mb-1">
            No Parcels on the Shelf
          </h3>
          <p className="text-xs text-ink-light mt-1 mb-6 font-serif leading-relaxed">
            You have not placed any orders yet. Visit the Bookshop to acquire physical prints.
          </p>
          <Link to="/bookshop">
            <Button variant="brass" className="gap-2 shadow">
              <span>Visit Bookshop</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-wood/20">
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
            Page {page} of {totalPages}
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
    </div>
  );
};
