
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Chargement...", showSpinner = true }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center space-y-6">
        {showSpinner && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-4 border-stone-200 dark:border-stone-800 border-t-stone-900 dark:border-t-white rounded-full mx-auto"
            aria-hidden="true"
          />
        )}
        <p className="text-stone-600 dark:text-stone-400 font-serif italic text-xl animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default React.memo(LoadingOverlay);
