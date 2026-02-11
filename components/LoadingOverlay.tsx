
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
  showSpinner?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Chargement...", showSpinner = true }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center space-y-4">
        {showSpinner && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full mx-auto"
          />
        )}
        <p className="text-stone-600 font-serif italic text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
