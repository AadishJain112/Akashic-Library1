import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Layout } from './Layout';

// Pages
import { HomePage } from '../features/home/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { AccountPage } from '../features/account/AccountPage';
import { CataloguePage } from '../features/catalogue/CataloguePage';
import { BookDetailPage } from '../features/book/BookDetailPage';
import { ShelvesPage } from '../features/library/ShelvesPage';
import { PicksPage } from '../features/recommendations/PicksPage';
import { ImportPage } from '../features/import/ImportPage';
import { CirclePage } from '../features/community/CirclePage';
import { DiscussionDetailPage } from '../features/community/DiscussionDetailPage';
import { BookshopPage } from '../features/store/BookshopPage';
import { ProductDetailPage } from '../features/store/ProductDetailPage';
import { CartPage } from '../features/cart/CartPage';
import { CheckoutPage } from '../features/checkout/CheckoutPage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { OrderDetailPage } from '../features/orders/OrderDetailPage';
import { StockroomPage } from '../features/staff/StockroomPage';
import { ModerationDeskPage } from '../features/staff/ModerationDeskPage';
import { ForbiddenPage } from '../features/system/ForbiddenPage';
import { NotFoundPage } from '../features/system/NotFoundPage';

// Route Guards
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <span className="text-sm font-serif italic text-ink-light animate-pulse">
          Consulting patron archives…
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

const RequireStoreStaff: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isStoreStaff, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isStoreStaff) return <Navigate to="/restricted" replace />;
  return children;
};

const RequireModerator: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isMod, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isMod) return <Navigate to="/restricted" replace />;
  return children;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/bookshop" element={<BookshopPage />} />
        <Route path="/bookshop/:productId" element={<ProductDetailPage />} />
        <Route path="/circle" element={<CirclePage />} />
        <Route path="/circle/:id" element={<DiscussionDetailPage />} />

        {/* Authenticated Reader Routes */}
        <Route
          path="/card"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/shelves"
          element={
            <RequireAuth>
              <ShelvesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/picks"
          element={
            <RequireAuth>
              <PicksPage />
            </RequireAuth>
          }
        />
        <Route
          path="/trolley"
          element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/parcels"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/parcels/:id"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/import"
          element={
            <RequireAuth>
              <ImportPage />
            </RequireAuth>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/stockroom"
          element={
            <RequireStoreStaff>
              <StockroomPage />
            </RequireStoreStaff>
          }
        />
        <Route
          path="/moderation"
          element={
            <RequireModerator>
              <ModerationDeskPage />
            </RequireModerator>
          }
        />

        {/* System Error Screens */}
        <Route path="/restricted" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
