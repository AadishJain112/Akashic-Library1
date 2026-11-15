import React from 'react';
import { Button } from './Button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  title = 'The Librarian Stepped Out',
  message = 'A sudden gust of wind scattered the catalog cards. We could not retrieve this section of the library.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-parchment-50 border border-wood/30 rounded-2xl shadow-parchment max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-amber-100/70 border border-brass-antique/40 flex items-center justify-center text-brass-antique mb-4">
        <AlertTriangle className="w-8 h-8 text-brass-dark" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-ink-dark mb-2">{title}</h3>
      <p className="text-sm text-ink-light mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="brass" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Consult the Stacks Again</span>
        </Button>
      )}
    </div>
  );
};
