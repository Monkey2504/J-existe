
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} flex items-center justify-center bg-stone-900 rounded-xl overflow-hidden shadow-inner`}>
      <span className="text-white font-impact text-xl tracking-tighter select-none">JE</span>
    </div>
  );
};

export default Logo;
