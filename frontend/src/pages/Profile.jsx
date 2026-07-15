import React from "react";
import { useAuth } from "../hooks/useAuth";
import { User, Shield, Key, Clock, Award } from "lucide-react";

export function Profile() {
  const { user, token, getUserRole, isAdmin, isAnalyst } = useAuth();

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Investigator Profile</h1>
        <p className="text-sm text-slate-400">View credential authorizations, active sessions indicators, and assigned security clear levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core User Details */}
        <div className="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="h-20 w-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-3xl font-extrabold uppercase shadow-inner">
            {user ? user.email.substring(0, 2) : "US"}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">{user ? user.email : "user@fraudsense.com"}</h3>
            <span className="text-xs text-slate-500 font-mono mt-0.5 block">Investigator ID: ID-{(user ? user.id : 0) * 1000 + 49}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-xxs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
              {getUserRole()}
            </span>
            {isAnalyst() && (
              <span className="px-2.5 py-0.5 rounded-full text-xxs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                ANALYST GUARD
              </span>
            )}
          </div>
        </div>

        {/* Security Access Details */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Security Clearances & Privileges
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-300 block">Access Clearances</span>
                <span className="text-xs text-slate-500 mt-1 block">
                  {isAdmin()
                    ? "Full read/write permissions on configurations, models monitor metrics, case audits logs, and database tables management."
                    : isAnalyst()
                    ? "Read/write permissions on flagging queues, transaction score evaluations, and watchlist records operations."
                    : "Read-only access on dashboards feeds and static charts logs."}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-300 block">Session Indicator</span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Active connection verified under JWT credentials token. Expiration configuration is set dynamically by administrative policy rules.
                </span>
              </div>
            </div>
          </div>

          {token && (
            <div className="border-t border-slate-850 pt-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-slate-500" />
                Active JWT Bearer Signature Token
              </span>
              <div className="bg-slate-950 p-3 rounded border border-slate-850 text-xxs font-mono text-slate-500 break-all select-all leading-normal max-h-20 overflow-y-auto">
                {token}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
