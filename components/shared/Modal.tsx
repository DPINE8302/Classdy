
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<typeof size, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-soft-lg w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-full p-1 -m-1" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
