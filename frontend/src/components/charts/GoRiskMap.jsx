import React from "react";
import { MapPin } from "lucide-react";

export function GoRiskMap() {
  const locations = [
    { city: "Miami Metro Area, FL", count: 52, percentage: 88, status: "High Risk", color: "bg-red-500", text: "text-red-400" },
    { city: "New York Tri-State, NY", count: 38, percentage: 72, status: "Moderate", color: "bg-amber-500", text: "text-amber-400" },
    { city: "Greater Chicago, IL", count: 19, percentage: 45, status: "Moderate", color: "bg-amber-500", text: "text-amber-400" },
    { city: "Los Angeles Basin, CA", count: 12, percentage: 30, status: "Low Risk", color: "bg-emerald-500", text: "text-emerald-400" },
    { city: "Austin Tech Hub, TX", count: 4, percentage: 12, status: "Low Risk", color: "bg-emerald-500", text: "text-emerald-400" }
  ];

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {locations.map((loc, idx) => (
        <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-850">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              {loc.city}
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400 text-[11px]">{loc.count} events</span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border border-current/20 ${loc.text}`}>
                {loc.status}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${loc.color}`}
              style={{ width: `${loc.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default GoRiskMap;
