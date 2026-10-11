import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Slidebar from "./Slidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAlertStore } from "../../store/alertStore";
import { ShieldAlert, X } from "lucide-react";

export function MainLayout() {
  // Start the live notification polling loop
  useWebSocket();

  const [mobileOpen, setMobileOpen] = useState(false);
  const activeAlert = useAlertStore((state) => state.activeBannerAlert);
  const dismissBanner = useAlertStore((state) => state.dismissBanner);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Slidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMobileToggle={() => setMobileOpen(!mobileOpen)} />

        {/* Live Security Threat Banner */}
        {activeAlert && (
          <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-slate-900 text-slate-100 px-4 md:px-6 py-3 flex justify-between items-center shadow-2xl border-b border-red-800/80 animate-in slide-in-from-top duration-300 z-20">
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <div className="h-8 w-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 threat-pulse-badge">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="font-bold font-mono text-red-400 uppercase tracking-wider text-[11px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                  CRITICAL THREAT
                </span>
                <span className="font-semibold text-slate-100">{activeAlert.message}</span>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Dismiss</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 flex flex-col">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;