export function getRiskColorClass(riskLevel) {
  switch (String(riskLevel).toUpperCase()) {
    case "HIGH":
    case "FRAUD":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "MEDIUM":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "LOW":
    case "GENUINE":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    default:
      return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

export function getRiskColorHex(riskLevel) {
  switch (String(riskLevel).toUpperCase()) {
    case "HIGH":
    case "FRAUD":
      return "#ef4444";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
    case "GENUINE":
      return "#10b981";
    default:
      return "#94a3b8";
  }
}
