import { notifications } from '@mantine/notifications';
import React from 'react';

export function showToast(message: string, actionLabel?: string, onAction?: () => void) {
  const id = 'toast-' + Date.now();
  
  notifications.show({
    id,
    message: actionLabel ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{message}</span>
        <button 
          onClick={() => { 
            if (onAction) onAction(); 
            notifications.hide(id); 
          }}
          style={{
            background: 'var(--mantine-color-blue-filled)',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {actionLabel}
        </button>
      </div>
    ) : message,
    autoClose: 4000,
    withCloseButton: !actionLabel,
  });
}

// Keep a dummy useToast so we don't break App.tsx immediately (we will remove ToastContainer shortly)
export function useToast() {
  return null;
}
export function clearToast() {}
