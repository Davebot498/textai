import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  isVisible = true 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) {
          setTimeout(onClose, 300); // Allow fade out animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white border-green-500';
      case 'error':
        return 'bg-red-600 text-white border-red-500';
      case 'warning':
        return 'bg-yellow-600 text-black border-yellow-500';
      default:
        return 'bg-gray-800 text-white border-gray-700';
    }
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  if (!show) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      flex items-center gap-3 
      px-4 py-3 rounded-lg 
      border shadow-lg
      transform transition-all duration-300 ease-in-out
      ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${getTypeClasses()}
      max-w-sm
    `}>
      {getIcon()}
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      
      <button
        onClick={handleClose}
        className="ml-2 hover:opacity-70 transition-opacity duration-200"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast container component for managing multiple toasts
export const ToastContainer = ({ toasts = [], onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={toast.isVisible}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default Toast;