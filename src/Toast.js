import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext();

const TOAST_COLORS = {
  success: { border: "rgba(34,197,94,0.4)", icon: "#22C55E", symbol: "✓" },
  error: { border: "rgba(239,68,68,0.4)", icon: "#EF4444", symbol: "✕" },
  info: { border: "rgba(37,99,235,0.4)", icon: "#3B82F6", symbol: "i" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "10px" }}>
        {toasts.map((toast) => {
          const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
          return (
            <div
              key={toast.id}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "#18181B", border: `1px solid ${colors.border}`,
                borderRadius: "10px", padding: "12px 18px", minWidth: "240px", maxWidth: "360px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "toast-in 0.25s ease",
              }}
            >
              <span style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: colors.border, color: colors.icon,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
              }}>
                {colors.symbol}
              </span>
              <span style={{ color: "#E5E5E7", fontSize: "13.5px" }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
