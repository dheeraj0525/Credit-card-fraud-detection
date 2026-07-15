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
  LogOut
} from "lucide-react";

export function Slidebar() {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col h-full shrink-0">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Shield className="h-6 w-6 text-blue-500" />
        <span className="font-semibold text-lg text-slate-100 tracking-wide">FraudSense</span>
      </div>

      {/* Menu Options */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Main</p>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/dashboard")
                    ? "bg-slate-800 text-white border-l-2 border-blue-500"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/analytics")
                    ? "bg-slate-800 text-white border-l-2 border-blue-500"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive("/profile")
                    ? "bg-slate-800 text-white border-l-2 border-blue-500"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {isAnalyst() && (
          <div>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Analyst Tools</p>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/transactions"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/transactions")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Evaluator
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/watchlist")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  to="/flagged"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/flagged")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Flagged Queue
                </Link>
              </li>
            </ul>
          </div>
        )}

        {isAdmin() && (
          <div>
            <p className="text-xxs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Administration</p>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/admin/users")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  User Control
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/health"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/admin/health")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  System Health
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/model"
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/admin/model")
                      ? "bg-slate-800 text-white border-l-2 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <Cpu className="h-4 w-4" />
                  Model Monitor
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Slidebar;