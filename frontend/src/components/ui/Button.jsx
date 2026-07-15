import React from "react";

export function Button({ children, className = "", variant = "primary", disabled, ...props }) {
  const baseStyle = "flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "text-white bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-sm",
    secondary: "border border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white",
    danger: "text-white bg-red-600 hover:bg-red-700 active:scale-98 shadow-sm",
    success: "text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-sm",
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
