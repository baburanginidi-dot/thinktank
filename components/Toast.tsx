import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Defines the type of toast message.
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Represents a toast message object.
 */
export interface ToastMessage {
  /** Unique identifier for the toast. */
  id: string;
  /** The message text to display. */
  message: string;
  /** The type of the toast (visual style). */
  type: ToastType;
}

/**
 * Props for the ToastContainer component.
 */
interface ToastProps {
  /** List of active toast messages. */
  toasts: ToastMessage[];
  /** Callback to remove a toast by ID. */
  removeToast: (id: string) => void;
}

/**
 * Container for displaying a list of toast notifications.
 * Rendered fixed at the bottom right of the screen.
 *
 * @param {ToastProps} props - The props for the container.
 * @returns {JSX.Element} The rendered toast container.
 */
export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

/**
 * Individual toast item component.
 * Automatically dismisses itself after 5 seconds.
 *
 * @param {object} props - The component props.
 * @param {ToastMessage} props.toast - The toast message to display.
 * @param {function} props.onRemove - Callback to remove this toast.
 * @returns {JSX.Element} The rendered toast item.
 */
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
