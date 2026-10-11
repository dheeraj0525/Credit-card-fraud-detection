import React from "react";

export function Badge({ children, className = "", variant = "default", ...props }) {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-colors";
  
  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700/80",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
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
