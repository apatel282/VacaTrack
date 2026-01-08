import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount the component
      setShouldRender(true);

      // Prevent body scroll on iOS
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      // Start animation after mount (next frame)
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 10);

      return () => clearTimeout(timer);
    } else {
      // Start exit animation
      setShouldShow(false);

      // Unmount after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }, 300); // Match transition duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        style={{ opacity: shouldShow ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md bg-bg-100 dark:bg-bg-100 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ease-out"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          opacity: shouldShow ? 1 : 0,
          transform: shouldShow
            ? 'translateY(0) scale(1)'
            : 'translateY(20px) scale(0.95)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-300 dark:border-bg-300">
          <h2 className="text-lg font-semibold text-text-100 dark:text-text-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-bg-200 dark:hover:bg-bg-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-text-200 dark:text-text-200" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
