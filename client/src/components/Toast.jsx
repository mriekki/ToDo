import React from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
