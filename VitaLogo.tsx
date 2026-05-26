import React from "react";

interface VitaLogoProps {
  className?: string;
  showText?: boolean;
  showSlogan?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function VitaLogo({ 
  className = "", 
  showText = true, 
  showSlogan = false, 
  size = "md",
  logoUrl = "",
  noBackground = false
}: VitaLogoProps) {
  // Compute container bounds based on sizes
  const sizes = {
    sm: "h-[24px] w-[24px]",
    md: "h-12 w-12",
    lg: "h-20 w-20",
    xl: "h-28 w-28"
  };

  const wrapperClasses = noBackground
    ? "bg-transparent border-transparent shadow-none"
    : {
        sm: "rounded-md p-1 bg-[#22C55E]/5 dark:bg-[#22C55E]/10 border border-emerald-500/10 dark:border-emerald-500/20 backdrop-blur-xs",
        md: "rounded-xl p-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 backdrop-blur-xs",
        lg: "rounded-2xl p-4.5 bg-white/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-xs",
        xl: "rounded-3xl p-6 bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm"
      }[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Crisp vector rendering or dynamic image upload - wrapped in a gorgeous rounded border backdrop */}
      <div className={`${wrapperClasses} flex items-center justify-center transition-all duration-300 hover:scale-105`}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Vita Logo" 
            className={`${sizes[size]} object-contain`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg 
            viewBox="0 0 100 100" 
            className={sizes[size]} 
            fill="none" 
            stroke="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Green Slanted block */}
            <path 
              d="M20 20 L40 20 L58 75 L38 75 Z" 
              fill="#22C55E" 
            />
            {/* Right Orange Slanted block */}
            <path 
             d="M75 10 L55 10 L45 38 L65 38 Z" 
              fill="#EA580C" 
            />
            <path 
              d="M61 48 L51 48 L42 75 L52 75 Z" 
              fill="#EA580C" 
            />
          </svg>
        )}
      </div>
      
      {showText && (
        <div className="text-center mt-2">
          <h2 className="text-xl font-bold tracking-tight text-[#1319c9] dark:text-blue-400 font-sans leading-none">
            VITA
          </h2>
          <h3 className="text-[10px] font-semibold tracking-[0.25em] text-[#1319c9] dark:text-blue-300 font-sans leading-none mt-1">
            DATA
          </h3>
        </div>
      )}

      {showSlogan && (
        <p className="text-xs italic text-gray-500 dark:text-gray-400 font-serif mt-2 text-center max-w-xs leading-relaxed">
          Data from the ground. Decisions from the heart.
        </p>
      )}
    </div>
  );
}

