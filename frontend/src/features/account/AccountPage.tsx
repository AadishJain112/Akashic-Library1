import React from 'react';
import { useAuth } from '../../app/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../../api/library';
import { ordersApi } from '../../api/orders';
import { LibraryCard3D } from '../../components/css3d/LibraryCard3D';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, BookOpen, ShoppingBag, ShieldCheck, Info } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  // Load real library entries for accurate stats
  const { data: libraryEntries } = useQuery({
    queryKey: ['library-all'],
    queryFn: () => libraryApi.getAllLibraryEntries(),
    enabled: Boolean(user),
  });

  // Load real order count
  const { data: ordersData } = useQuery({
    queryKey: ['orders-count'],
    queryFn: () => ordersApi.getOrders(1, 1),
    enabled: Boolean(user),
  });

  if (!user) return null;

  const entries = libraryEntries || [];
  const wantToRead = entries.filter((e) => e.status === 'WANT_TO_READ').length;
  const reading = entries.filter((e) => e.status === 'READING').length;
  const read = entries.filter((e) => e.status === 'READ').length;
  const favorites = entries.filter((e) => e.favorited).length;
  const ordersCount = ordersData?.count || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
          Archival Credential
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1">
          Your Library Card
        </h1>
        <p className="text-sm text-ink-light mt-1 font-serif">
          Official membership charter preserved in the Akashic Grand Ledger.
        </p>
      </div>

      {/* 3D Library Card */}
      <div className="w-full max-w-lg mb-8">
        <LibraryCard3D
          isAccountMode
          username={user.username}
          displayName={user.display_name}
          email={user.email}
          role={user.role}
          createdAt={user.created_at}
          bio={user.bio}
          stats={{
            wantToRead,
            reading,
            read,
            favorites,
            ordersCount,
          }}
        />
      </div>

      {/* Official Read-Only Record Notice */}
      <div className="w-full max-w-lg p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3 mb-8 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-serif">
          Official patron charters are inscribed directly into the permanent archives. In accordance with Akashic records regulations, patron identification fields are strictly read-only once issued.
        </p>
      </div>

      {/* Quick Action Navigation */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-4 mb-8">
        <Link
          to="/shelves"
          className="p-4 bg-parchment-50 rounded-2xl border border-wood/20 shadow-sm hover:shadow hover:border-wood/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-wood/15 flex items-center justify-center text-wood-dark group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-ink-dark">Personal Shelves</h4>
            <p className="text-xs text-ink-light">{entries.length} preserved works</p>
          </div>
        </Link>

        <Link
          to="/parcels"
          className="p-4 bg-parchment-50 rounded-2xl border border-wood/20 shadow-sm hover:shadow hover:border-wood/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-ink-dark">Order History</h4>
            <p className="text-xs text-ink-light">{ordersCount} dispatched parcels</p>
          </div>
        </Link>
      </div>

      {/* Return Library Card (Logout) */}
      <Button
        variant="danger"
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Return Library Card (Sign Out)</span>
      </Button>
    </div>
  );
};
