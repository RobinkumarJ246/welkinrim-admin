'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const error = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const warning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const info = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'success' && <CheckIcon />}
            {toast.type === 'error' && <ErrorIcon />}
            {toast.type === 'warning' && <WarningIcon />}
            {toast.type === 'info' && <InfoIcon />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 1001;
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: var(--color-ink);
          color: var(--color-white-pure);
          border-radius: 4px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
          cursor: pointer;
          animation: slideIn 300ms ease;
          min-width: 280px;
          max-width: 420px;
        }

        .toast svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .toast span {
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.4;
        }

        .toast-success {
          border-left: 3px solid var(--color-success);
        }

        .toast-error {
          border-left: 3px solid var(--color-error);
        }

        .toast-warning {
          border-left: 3px solid var(--color-warning);
        }

        .toast-info {
          border-left: 3px solid var(--color-info);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .toast-container {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }

          .toast {
            min-width: unset;
            width: 100%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l4 4L15 5" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="7" />
      <path d="M9 5v4M9 13v.5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 2l8 14H1L9 2z" />
      <path d="M9 7v4M9 15v.5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="7" />
      <path d="M9 8v5M9 6v.5" />
    </svg>
  );
}
