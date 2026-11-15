import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../app/ThemeContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { playPageTurn } = useTheme();

  const addToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);
    playPageTurn();

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, [playPageTurn]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, title?: string) => addToast({ type: 'success', message, title });
  const error = (message: string, title?: string) => addToast({ type: 'error', message, title });
  const info = (message: string, title?: string) => addToast({ type: 'info', message, title });

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast Bookmark Container */}
      <div
        className="fixed top-0 right-8 z-50 flex flex-col gap-3 pointer-events-none w-80 max-w-[calc(100vw-2rem)]"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const ribbonBg =
              t.type === 'success'
                ? 'bg-jewel-emerald text-white'
                : t.type === 'error'
                ? 'bg-jewel-ruby text-white'
                : 'bg-wood-dark text-parchment-50';

            return (
              <motion.div
                key={t.id}
                initial={{ y: -60, opacity: 0, rotate: -2 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={clsx(
                  'pointer-events-auto rounded-b-xl shadow-parchment-lg p-4 border-t-4 border-brass relative overflow-hidden',
                  ribbonBg
                )}
              >
                {/* Ribbon bookmark swallowtail bottom accent */}
                <div className="flex items-start gap-3">
                  {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brass-light shrink-0 mt-0.5" />}
                  {t.type === 'error' && <AlertCircle className="w-5 h-5 text-amber-200 shrink-0 mt-0.5" />}
                  {t.type === 'info' && <Info className="w-5 h-5 text-brass-light shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    {t.title && <h4 className="font-serif font-bold text-sm leading-tight text-parchment-50">{t.title}</h4>}
                    <p className="text-xs leading-relaxed text-parchment-100 mt-0.5">{t.message}</p>
                    {t.action && (
                      <button
                        onClick={t.action.onClick}
                        className="mt-2 text-xs font-bold underline text-brass-light hover:text-white"
                      >
                        {t.action.label}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-parchment-200 hover:text-white shrink-0 p-1 rounded focus:outline-none"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
