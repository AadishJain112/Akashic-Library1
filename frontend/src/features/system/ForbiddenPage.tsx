import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Compass, Lock } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-parchment-50 border-2 border-jewel-ruby/30 rounded-3xl p-8 text-center shadow-parchment-lg parchment-texture">
        {/* Velvet Rope & Stanchion Illustration */}
        <div className="relative w-28 h-20 mx-auto mb-6 flex items-center justify-between">
          <div className="w-3 h-16 bg-brass-dark rounded-full shadow" />
          {/* Velvet Rope */}
          <div className="flex-1 h-3 bg-jewel-ruby rounded-full shadow-md transform translate-y-1 mx-1 border border-red-900/40 velvet-curtain" />
          <div className="w-3 h-16 bg-brass-dark rounded-full shadow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-6 h-6 text-brass-light" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-jewel-ruby">
          Restricted Wing · Error 403
        </span>
        <h2 className="font-serif text-3xl font-extrabold text-ink-dark mt-2 mb-3">
          The Restricted Section
        </h2>
        <p className="text-sm text-ink-light leading-relaxed mb-6 font-serif">
          Access beyond this velvet cordon is reserved for archival staff. Your current charter credential (<span className="font-mono font-bold text-ink-dark">{role}</span>) does not grant entry to this wing.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Step Back
          </Button>
          <Link to="/">
            <Button variant="primary" className="gap-2">
              <Compass className="w-4 h-4" />
              <span>Return to Grand Hall</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
