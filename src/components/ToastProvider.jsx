'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2.5 rounded-full shadow-xl z-[9999] animate-in fade-in slide-in-from-bottom-6 duration-300 text-sm font-medium flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-white">
            <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
          </div>
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
