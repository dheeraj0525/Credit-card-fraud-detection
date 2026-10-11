import React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
      <table className={`w-full border-collapse text-left text-xs ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={`bg-slate-900/90 border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={`divide-y divide-slate-800/50 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr className={`hover:bg-slate-800/30 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <th className={`px-4 py-3.5 font-semibold text-slate-400 whitespace-nowrap ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={`px-4 py-3 text-slate-300 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}
