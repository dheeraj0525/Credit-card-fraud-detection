import React from "react";

export function GoRiskMap() {
  const locations = [
    { city: "Miami, FL", count: 52, percentage: 88, status: "High Risk" },
    { city: "New York, NY", count: 38, percentage: 72, status: "Medium Risk" },
    { city: "Chicago, IL", count: 19, percentage: 45, status: "Medium Risk" },
    { city: "Los Angeles, CA", count: 12, percentage: 30, status: "Low Risk" },
    { city: "Austin, TX", count: 4, percentage: 12, status: "Low Risk" }
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {locations.map((loc, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>{loc.city} ({loc.count} Alerts)</span>
            <span className={
              loc.status === "High Risk" ? "text-red-400" :
              loc.status === "Medium Risk" ? "text-amber-400" : "text-emerald-400"
            }>{loc.status}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                loc.status === "High Risk" ? "bg-red-500" :
                loc.status === "Medium Risk" ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${loc.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default GoRiskMap;
