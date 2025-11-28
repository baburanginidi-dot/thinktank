import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-stone-800',
    error: 'bg-white border-l-4 border-red-500 text-stone-800',
    info: 'bg-white border-l-4 border-blue-500 text-stone-800',
  };

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded shadow-lg min-w-[300px] transform transition-all duration-300 animate-fade-in-up ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-stone-400 hover:text-stone-600">
        <X size={16} />
      </button>
    </div>
  );
};