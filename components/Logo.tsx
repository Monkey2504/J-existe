
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} flex items-center justify-center bg-stone-900 rounded-lg overflow-hidden shadow-xl border-b-2 border-stone-950`}>
      <span className="text-white font-mono text-xl font-black tracking-tighter select-none">JE</span>
    </div>
  );
};

export default Logo;
