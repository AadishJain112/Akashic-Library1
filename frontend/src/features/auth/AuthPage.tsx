import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LibraryCard3D } from '../../components/css3d/LibraryCard3D';
import { Eye, EyeOff, BookOpen, Sparkles, Check, KeyRound } from 'lucide-react';
import { NormalizedError } from '../../api/http';

export const AuthPage: React.FC<{ initialMode?: 'login' | 'register' }> = ({
  initialMode = 'login',
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract redirect query parameter
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, redirectPath]);

  // Sync mode when route changes between /login and /register
  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setFieldErrors({});
    setGeneralError(null);
  }, [initialMode]);

  // Password strength hint
  const passwordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strengthScore = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (password.length < 8) {
          setFieldErrors({ password: ['Password must be at least 8 characters long.'] });
          setIsSubmitting(false);
          return;
        }
        await register({ username, email, password });
        success('Your reader charter has been inscribed! Welcome to Akashic Library.', 'Charter Issued');
      } else {
        await login({ username, password });
        success('Welcome back to the Reading Hall, Scholar.', 'Credentials Verified');
      }
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const norm = err as NormalizedError;
      if (norm.status === 401) {
        setGeneralError("Those credentials didn't match our records.");
        toastError("Those credentials didn't match our records.");
      } else {
        if (norm.fieldErrors && Object.keys(norm.fieldErrors).length > 0) {
          setFieldErrors(norm.fieldErrors);
        } else {
          setGeneralError(norm.message);
          toastError(norm.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFieldErrors({});
    setGeneralError(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Background Ambience Graphic */}
      <div className="max-w-md w-full mb-8 text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark tracking-wide">
          {isRegister ? 'Apply For A Library Card' : 'Present Your Library Card'}
        </h1>
        <p className="text-xs md:text-sm text-ink-light mt-2 font-serif">
          {isRegister
            ? 'Inscribe your name in the archives to borrow, review, and curate personal shelves.'
            : 'Access your preserved shelves, trolley, and reading circle manuscripts.'}
        </p>
      </div>

      {/* 3D Library Card Container on Wooden Desk */}
      <div className="w-full max-w-md bg-wood-deep/10 p-6 md:p-8 rounded-3xl border border-wood/30 shadow-2xl backdrop-blur-xs parchment-texture relative">
        {/* Brass Desk Lamp Pin */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brass-dark text-parchment-50 text-[10px] font-bold px-3 py-0.5 rounded-full shadow flex items-center gap-1 border border-brass-light/50">
          <KeyRound className="w-3 h-3 text-brass-light" />
          <span>Charter Desk</span>
        </div>

        {/* The 3D Library Card */}
        <LibraryCard3D
          isFlipped={isRegister}
          onFlip={toggleMode}
          username={username || 'Scholar'}
          frontContent={
            <div className="text-center py-2">
              <span className="text-xs font-serif italic text-ink-light">Akashic Library Card</span>
              <p className="font-serif text-lg font-bold text-ink-dark mt-1">Reader Identification</p>
              <div className="w-16 h-0.5 bg-brass mx-auto my-2" />
              <p className="text-[11px] text-ink-light">Ready for sign-in validation</p>
            </div>
          }
          backContent={
            <div className="text-center py-2">
              <span className="text-xs font-serif italic text-ink-light">Charter Registry</span>
              <p className="font-serif text-lg font-bold text-ink-dark mt-1">New Scholar Registration</p>
              <div className="w-16 h-0.5 bg-brass mx-auto my-2" />
              <p className="text-[11px] text-ink-light">Ready to inscribe credentials</p>
            </div>
          }
        />

        {/* Real Accessible DOM Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {generalError && (
            <div className="p-3 rounded-xl bg-jewel-ruby/10 border border-jewel-ruby/30 text-xs text-jewel-ruby font-medium flex items-center gap-2">
              <span>•</span>
              <span>{generalError}</span>
            </div>
          )}

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. athena_scholar"
            required
            minLength={3}
            maxLength={150}
            error={fieldErrors.username}
            helperText="3 to 150 characters"
          />

          {isRegister && (
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@library.org"
              required
              error={fieldErrors.email}
            />
          )}

          <div className="relative">
            <Input
              label="Secret Passphrase"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              error={fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-ink-light hover:text-ink focus:outline-none p-1"
              aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator for Register */}
          {isRegister && password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1.5 w-full bg-wood/15 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthScore >= 1 ? 'bg-jewel-ruby w-1/4' : 'w-0'
                  }`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthScore >= 2 ? 'bg-amber-500 w-1/4' : 'w-0'
                  }`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthScore >= 3 ? 'bg-jewel-emerald w-1/4' : 'w-0'
                  }`}
                />
                <div
                  className={`h-full transition-all duration-300 ${
                    strengthScore >= 4 ? 'bg-jewel-sapphire w-1/4' : 'w-0'
                  }`}
                />
              </div>
              <p className="text-[10px] text-ink-light">
                Passphrase strength: {strengthScore < 2 ? 'Modest' : strengthScore < 4 ? 'Solid' : 'Unbreakable'}
              </p>
            </div>
          )}

          <Button
            variant="brass"
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-3 mt-4 text-sm font-bold shadow-md"
          >
            {isRegister ? 'Inscribe & Obtain Card' : 'Present Card (Sign In)'}
          </Button>

          {/* Flip / Toggle View Button */}
          <div className="text-center pt-3 border-t border-wood/20">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs font-serif font-bold text-wood-dark hover:text-ink-dark transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>
                {isRegister
                  ? 'Already hold a library card? Sign In'
                  : 'New scholar to the library? Apply for a card'}
              </span>
              <span className="text-brass-dark">↺</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
