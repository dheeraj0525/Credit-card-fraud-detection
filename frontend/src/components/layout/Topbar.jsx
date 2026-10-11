import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAlertStore } from "../../store/alertStore";
import { Bell, Menu, User, ShieldAlert, LogOut, ChevronDown, Activity } from "lucide-react";

export function Topbar({ onMobileToggle }) {
  const { user, logout, getUserRole } = useAuth();
  const location = useLocation();
  const notifications = useAlertStore((state) => state.notifications);
  const fetchNotifications = useAlertStore((state) => state.fetchNotifications);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadList = notifications.filter((n) => !n.read);
  const unreadCount = unreadList.length;

  // Format page titles dynamically
  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard":
        return "Live Security Operations Center";
      case "/analytics":
        return "Security Analytics Center";
      case "/profile":
        return "Investigator Profile";
      case "/transactions":
        return "XGBoost Transaction Scorer";
      case "/watchlist":
        return "Security Watchlist";
      case "/flagged":
        return "Fraud Flagged Queue";
      case "/admin/users":
        return "Investigator Accounts Control";
      case "/admin/health":
        return "System Performance Uptime";
      case "/admin/model":
        return "Model Diagnostics & Controls";
      default:
        return "Security Operations Center";
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 md:px-6 backdrop-blur-md sticky top-0 z-30">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight font-sans">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              REALTIME MONITORED
            </span>
          </div>
        </div>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Real-time System Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Activity className="h-3.5 w-3.5" />
          <span>Model Inference: Active</span>
        </div>

        {/* Alerts Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900 threat-pulse-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Modal Menu */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center px-3 py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  Security Notifications ({unreadCount} unread)
                </span>
              </div>

              <div className="flex flex-col gap-1 my-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No active unread security alerts.
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-lg border text-xs flex flex-col gap-1 transition-colors ${
                        n.read
                          ? "bg-slate-950/40 border-slate-850 text-slate-400"
                          : "bg-red-500/10 border-red-500/20 text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-slate-100">{n.title || "Threat Alert"}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-xs uppercase shadow-sm">
              {user ? user.email.substring(0, 2) : "US"}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {user ? user.email.split("@")[0] : "User"}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                {getUserRole()}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* User Options Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-800 bg-slate-900/95 py-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-slate-100 truncate mt-0.5">{user ? user.email : "user"}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>Investigator Profile</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-t border-slate-800/80 mt-1"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;