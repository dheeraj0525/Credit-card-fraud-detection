import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAlertStore } from "../../store/alertStore";

export function Topbar() {
  const { user, logout } = useAuth();
  const notifications = useAlertStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 id="page-title" className="text-xl font-bold text-slate-100">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Alerts Notification Bell */}
        <div className="relative">
          <button className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <span className="sr-only">Notifications</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 focus:outline-none cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 font-semibold text-slate-200 uppercase">
              {user ? user.email.substring(0, 2) : "US"}
            </div>
            <span className="hidden sm:inline">{user ? user.email : "User"}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-800 bg-slate-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-xs font-semibold text-slate-300 truncate">{user ? user.email : "user"}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;