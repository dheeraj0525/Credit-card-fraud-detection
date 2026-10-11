import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  Shield,
  Eye,
  AlertTriangle,
  BarChart3,
  User,
  Users,
  Activity,
  Cpu,
  LogOut,
  X,
  Radio
} from "lucide-react";

export function Slidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout, isAdmin, isAnalyst, getUserRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out backdrop-blur-xl lg:translate-x-0 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen && setMobileOpen(false)}>
            <div className="h-9 w-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/25 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight font-sans">FraudSense</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">SOC Security Operations</span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6">
          {/* MAIN SECTION */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">
              Main Operations
            </p>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive("/dashboard")
                      ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive("/analytics")
                      ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span>Analytics</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen && setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive("/profile")
                      ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ANALYST TOOLS SECTION */}
          {isAnalyst() && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">
                Analyst Tools
              </p>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    to="/transactions"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/transactions")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>Evaluator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/watchlist"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/watchlist")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-4 w-4 shrink-0" />
                    <span>Watchlist</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/flagged"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/flagged")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Flagged Queue</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* ADMINISTRATION SECTION */}
          {isAdmin() && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">
                Administration
              </p>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/admin/users")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span>User Control</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/health"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/admin/health")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>System Health</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/model"
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                      isActive("/admin/model")
                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <Cpu className="h-4 w-4 shrink-0" />
                    <span>Model Monitor</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold uppercase shrink-0">
              {user ? user.email.substring(0, 2) : "US"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 truncate">{user ? user.email : "Investigator"}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{getUserRole()}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/15 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Slidebar;