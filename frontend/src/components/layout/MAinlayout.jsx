import React from "react";
import { Outlet } from "react-router-dom";
import Slidebar from "./Slidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAlertStore } from "../../store/alertStore";

export function MainLayout() {
  // Start the live notification polling loop
  useWebSocket();

  const activeAlert = useAlertStore((state) => state.activeBannerAlert);
  const dismissBanner = useAlertStore((state) => state.dismissBanner);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Slidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />

        {/* Live Notification Warning Banner */}
        {activeAlert && (
          <div className="bg-red-600 text-slate-950 font-bold px-6 py-2.5 flex justify-between items-center shadow-lg border-b border-red-700 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{activeAlert.message}</span>
            </div>
            <button
              onClick={dismissBanner}
              className="bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 text-xs px-3 py-1 rounded cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 flex flex-col">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;