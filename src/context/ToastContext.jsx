import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ title, description, variant = "default", duration = 4000 }) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    [],
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (props) => {
      if (typeof props === "string") {
        return addToast({ title: props });
      }
      return addToast(props);
    },
    [addToast],
  );

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 max-w-[420px] w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-start gap-3 w-full rounded-lg border p-4 shadow-lg
              animate-in slide-in-from-bottom-5 fade-in duration-300
              ${
                t.variant === "destructive"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : t.variant === "success"
                    ? "border-green-200 bg-green-50 text-green-900"
                    : "border-slate-200 bg-white text-slate-900"
              }
            `}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.variant === "destructive" ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : t.variant === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Info className="h-5 w-5 text-slate-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold">{t.title}</p>}
              {t.description && (
                <p className="text-sm opacity-80 mt-0.5">{t.description}</p>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
