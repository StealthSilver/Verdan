import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastTone = "success" | "info" | "warning" | "danger";

type ToastState = {
  open: boolean;
  message: string;
  tone: ToastTone;
};

type ToastApi = {
  show: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void; // alias for danger
  danger: (message: string) => void;
  dismiss: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    tone: "success",
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const api = useMemo<ToastApi>(() => {
    const show = (message: string, tone: ToastTone = "success") => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setToast({ open: true, message, tone });
      timerRef.current = window.setTimeout(() => {
        setToast((t) => ({ ...t, open: false }));
      }, 3200);
    };

    return {
      show,
      success: (m) => show(m, "success"),
      info: (m) => show(m, "info"),
      warning: (m) => show(m, "warning"),
      danger: (m) => show(m, "danger"),
      error: (m) => show(m, "danger"),
      dismiss: () => setToast((t) => ({ ...t, open: false })),
    };
  }, []);

  const ui = useMemo(() => {
    switch (toast.tone) {
      case "success":
        return {
          ring: "ring-emerald-200",
          border: "border-emerald-200",
          bg: "bg-gradient-to-br from-emerald-50 to-white",
          text: "text-emerald-950",
          iconBg: "bg-emerald-600",
          icon: (
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "info":
        return {
          ring: "ring-sky-200",
          border: "border-sky-200",
          bg: "bg-gradient-to-br from-sky-50 to-white",
          text: "text-sky-950",
          iconBg: "bg-sky-600",
          icon: (
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11 2 10a8 8 0 01 16 0zM10 5.75a.75.75 0 00-.75.75v.25a.75.75 0 001.5 0V6.5a.75.75 0 00-.75-.75zM10 8a.75.75 0 00-.75.75v5a.75.75 0 001.5 0v-5A.75.75 0 0010 8z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "warning":
        return {
          ring: "ring-amber-200",
          border: "border-amber-200",
          bg: "bg-gradient-to-br from-amber-50 to-white",
          text: "text-amber-950",
          iconBg: "bg-amber-600",
          icon: (
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.99-1.742 2.99H3.48c-1.53 0-2.493-1.656-1.743-2.99l6.52-11.59zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case "danger":
      default:
        return {
          ring: "ring-rose-200",
          border: "border-rose-200",
          bg: "bg-gradient-to-br from-rose-50 to-white",
          text: "text-rose-950",
          iconBg: "bg-rose-600",
          icon: (
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 00-1.5 0v4.75a.75.75 0 001.5 0V6.5zm0 7a.75.75 0 10-1.5 0 .75.75 0 001.5 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  }, [toast.tone]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast (bottom-left) */}
      <div
        className={`fixed bottom-5 left-5 z-50 transition-all duration-200 ${
          toast.open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ring-1 backdrop-blur-sm ${ui.bg} ${ui.border} ${ui.text} ${ui.ring}`}
        >
          <div className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl shadow-sm ${ui.iconBg}`}>
            {ui.icon}
          </div>
          <div className="text-sm font-semibold leading-5">{toast.message}</div>
          <button
            type="button"
            className="ml-2 rounded-xl px-2 py-1 text-current/70 hover:text-current hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
            onClick={() => setToast((t) => ({ ...t, open: false }))}
          >
            ×
          </button>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

