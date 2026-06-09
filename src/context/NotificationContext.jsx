import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let toastId = 0;

/**
 * NotificationProvider — app-wide toast notifications + focus mode support (RF026).
 */
export function NotificationProvider({ children }) {
  const [toasts, setToasts]         = useState([]);
  const [focusMode, setFocusMode]   = useState(false);
  const [focusUntil, setFocusUntil] = useState(null);
  const [unread, setUnread]         = useState(0);

  const addToast = useCallback(({ type = 'info', message, duration = 4000, critical = false }) => {
    // In focus mode, only critical notifications (mentions, impediments) pass through
    if (focusMode && !critical) return;

    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, critical }]);
    setTimeout(() => removeToast(id), duration);
  }, [focusMode]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const enableFocusMode = useCallback((durationMs) => {
    setFocusMode(true);
    if (durationMs) {
      const until = Date.now() + durationMs;
      setFocusUntil(until);
      setTimeout(() => {
        setFocusMode(false);
        setFocusUntil(null);
      }, durationMs);
    }
  }, []);

  const disableFocusMode = useCallback(() => {
    setFocusMode(false);
    setFocusUntil(null);
  }, []);

  const markAllRead = useCallback(() => setUnread(0), []);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        focusMode,
        focusUntil,
        enableFocusMode,
        disableFocusMode,
        unread,
        setUnread,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>');
  return ctx;
}
