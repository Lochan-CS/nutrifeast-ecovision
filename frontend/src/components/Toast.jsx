import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[#0D241B]/95 border-eco-green/40 text-eco-text shadow-eco-green/10'
                : toast.type === 'error'
                ? 'bg-[#2A1215]/95 border-eco-red/40 text-eco-text shadow-eco-red/10'
                : toast.type === 'warning'
                ? 'bg-[#291F0C]/95 border-eco-amber/40 text-eco-text shadow-eco-amber/10'
                : 'bg-eco-card/95 border-eco-border text-eco-text shadow-black/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-eco-green flex-shrink-0" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-eco-red flex-shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-eco-amber flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-eco-lime flex-shrink-0" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-eco-muted hover:text-eco-text p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
