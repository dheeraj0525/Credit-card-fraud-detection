import React from "react";

export function Badge({ children, className = "", variant = "default", ...props }) {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors";
  
  const variants = {
    default: "bg-slate-800 text-slate-100 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <span
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
