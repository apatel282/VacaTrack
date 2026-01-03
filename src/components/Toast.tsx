import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, action, duration = 10000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const pct = (remaining / duration) * 100;

      if (pct <= 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(onClose, 300);
      } else {
        setProgress(pct);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const handleAction = () => {
    action?.onClick();
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-bg-300 dark:bg-bg-300 text-text-100 dark:text-text-100 rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-between p-3">
        <span className="text-sm">{message}</span>
        <div className="flex items-center gap-2 ml-3">
          {action && (
            <button
              onClick={handleAction}
              className="text-sm font-medium text-accent-200 dark:text-accent-200 hover:opacity-80 transition-colors"
            >
              {action.label}
            </button>
          )}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 hover:bg-bg-200 dark:hover:bg-bg-300 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-bg-200 dark:bg-bg-200">
        <div
          className="h-full bg-primary-500 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
