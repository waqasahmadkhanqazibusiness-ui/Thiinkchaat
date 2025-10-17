import React from 'react';
import { useToast } from '../ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {}} // The context handles removal
        />
      ))}
    </div>
  );
};

export default ToastContainer;