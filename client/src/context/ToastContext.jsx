import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        pointerEvents: 'none'
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              background: '#0d1222',
              border: `1px solid ${
                t.type === 'success' ? '#10b981' :
                t.type === 'error' ? '#f43f5e' :
                t.type === 'warning' ? '#f59e0b' : '#00f0ff'
              }`,
              boxShadow: `0 10px 25px rgba(0,0,0,0.6), 0 0 15px ${
                t.type === 'success' ? 'rgba(16, 185, 129, 0.25)' :
                t.type === 'error' ? 'rgba(244, 63, 94, 0.25)' :
                t.type === 'warning' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0, 240, 255, 0.25)'
              }`,
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.1rem',
                lineHeight: 1,
                padding: '0 0.2rem'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
