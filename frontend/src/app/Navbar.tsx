import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useCartCount } from '../hooks/useCartCount';
import {
  BookOpen,
  Search,
  ShoppingBag,
  User,
  Sun,
  Shield,
  Layers,
  LogOut,
  Sparkles,
  Package,
  Boxes,
  PlusCircle,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar: React.FC = () => {
  const { user, role, isMod, isStoreStaff, isAdmin, logout } = useAuth();
  const { mood, setMood, lite3D, toggleLite3D, soundEnabled, setSoundEnabled } = useTheme();
  const { count: cartCount } = useCartCount();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setIsMoodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/bookshop', label: 'Bookshop' },
    { to: '/circle', label: 'Reading Circle' },
    ...(user
      ? [
          { to: '/shelves', label: 'My Shelves' },
          { to: '/picks', label: 'Picks' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-wood-dark border-b-2 border-brass-antique/50 shadow-md text-parchment-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-wood-deep border border-brass-light/60 flex items-center justify-center text-brass-light shadow group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-brass" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-lg md:text-xl tracking-wider text-brass-light leading-none group-hover:text-white transition-colors">
              AKASHIC LIBRARY
            </span>
            <span className="text-[9px] uppercase tracking-widest text-parchment-300 font-sans mt-0.5">
              The Grand Archive
            </span>
          </div>
        </Link>

        {/* PRIMARY NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-brass-light bg-black/20 font-semibold'
                    : 'text-parchment-200 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brass rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-2.5">
          {/* Card-Catalogue Drawer Search */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pull drawer & search catalog…"
                  className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-parchment-50 text-ink rounded-lg border-2 border-brass focus:outline-none shadow-inner"
                />
                <Search className="w-4 h-4 text-ink-light absolute left-2.5 top-2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-1 text-xs text-parchment-200 hover:text-white p-1"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="p-2 rounded-lg text-parchment-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs"
                title="Search the Catalogue"
              >
                <Search className="w-4 h-4 text-brass" />
                <span className="hidden sm:inline text-xs">Search</span>
              </button>
            )}
          </div>

          {/* Trolley Cart Icon (Auth only) */}
          {user && (
            <Link
              to="/trolley"
              className="relative p-2 rounded-lg text-parchment-200 hover:text-white hover:bg-white/10 transition-colors"
              title="View Book Trolley"
            >
              <ShoppingBag className="w-5 h-5 text-brass-light" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-jewel-ruby text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-wood-dark shadow animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* USER MENU / AUTH BUTTONS */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors border border-brass-antique/40 focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-brass text-ink-dark flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-parchment-100 max-w-[100px] truncate">
                  {user.display_name || user.username}
                </span>
              </button>

              {/* DROPDOWN MENU */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-parchment-50 rounded-2xl border-2 border-brass-antique/50 shadow-2xl p-2 text-ink z-50 parchment-texture animate-in fade-in slide-in-from-top-2">
                  {/* User Charter Banner */}
                  <div className="p-3 border-b border-wood/20 mb-1">
                    <p className="font-serif font-bold text-sm text-ink-dark truncate">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-[11px] text-ink-light truncate font-mono">@{user.username}</p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-wood/15 text-wood-deep border border-wood/30">
                      {role}
                    </div>
                  </div>

                  {/* Standard Reader Links */}
                  <div className="space-y-0.5 text-xs font-medium">
                    <Link
                      to="/card"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-brass-dark" />
                      <span>My Library Card</span>
                    </Link>

                    <Link
                      to="/shelves"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-wood-dark" />
                      <span>Personal Shelves</span>
                    </Link>

                    <Link
                      to="/parcels"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 transition-colors"
                    >
                      <Package className="w-4 h-4 text-amber-700" />
                      <span>My Book Parcels</span>
                    </Link>

                    <Link
                      to="/import"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-jewel-emerald" />
                      <span>Acquisitions (Import)</span>
                    </Link>
                  </div>

                  {/* STAFF SECTION (Role-guarded) */}
                  {(isMod || isStoreStaff || isAdmin) && (
                    <div className="mt-2 pt-2 border-t border-wood/20 space-y-0.5 text-xs font-semibold">
                      <span className="px-3 text-[10px] uppercase tracking-wider text-ink-light font-bold">
                        Staff Quarters
                      </span>
                      {isStoreStaff && (
                        <Link
                          to="/stockroom"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 text-wood-deep transition-colors"
                        >
                          <Boxes className="w-4 h-4 text-wood" />
                          <span>Store Stockroom</span>
                        </Link>
                      )}
                      {isMod && (
                        <Link
                          to="/moderation"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-wood/10 text-purple-900 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-jewel-amethyst" />
                          <span>Warden's Tower</span>
                        </Link>
                      )}
                      {isAdmin && (
                        <a
                          href="http://localhost:8000/admin/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-wood/10 text-red-900 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-jewel-ruby" />
                            <span>Back Office (Django)</span>
                          </span>
                          <ExternalLink className="w-3 h-3 text-ink-light" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* AMBIENCE & SETTINGS TOGGLES */}
                  <div className="mt-2 pt-2 border-t border-wood/20 space-y-1 text-xs">
                    {/* Reading Light Switcher */}
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-ink-light font-medium">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reading Light</span>
                      </span>
                      <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value as any)}
                        className="text-[11px] bg-parchment-100 rounded px-1.5 py-0.5 border border-wood/30 text-ink-dark font-medium"
                      >
                        <option value="morning">Morning Study</option>
                        <option value="golden">Golden Hour</option>
                        <option value="garden">Garden Room</option>
                      </select>
                    </div>

                    {/* Lite 3D Toggle */}
                    <button
                      onClick={toggleLite3D}
                      className="w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-wood/10 transition-colors text-ink-light"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-brass-dark" />
                        <span>Lite 3D Mode</span>
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded',
                          lite3D ? 'bg-jewel-emerald text-white' : 'bg-parchment-200 text-ink'
                        )}
                      >
                        {lite3D ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Sound Effects Toggle */}
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-full px-3 py-1.5 flex items-center justify-between rounded-lg hover:bg-wood/10 transition-colors text-ink-light"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {soundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-brass-dark" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-ink-light" />
                        )}
                        <span>Library Sounds</span>
                      </span>
                      <span
                        className={clsx(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded',
                          soundEnabled ? 'bg-jewel-emerald text-white' : 'bg-parchment-200 text-ink'
                        )}
                      >
                        {soundEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* LOGOUT */}
                  <div className="mt-2 pt-2 border-t border-wood/20">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-jewel-ruby transition-colors text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Return Library Card (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GUEST LOGIN / JOIN BUTTONS */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-parchment-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brass hover:bg-brass-light text-ink-dark shadow transition-colors"
              >
                Get Card
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
