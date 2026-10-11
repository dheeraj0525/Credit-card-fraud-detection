import React from "react";
import { useAuth } from "../hooks/useAuth";
import { User, Shield, Key, Clock, Award, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Profile() {
  const { user, token, getUserRole, isAdmin, isAnalyst } = useAuth();

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Investigator Profile & Authorizations
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Active credential state, cryptographic session signatures, and role-based security clearances.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>SESSION VERIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Core User Details Card */}
        <div className="md:col-span-1 soc-card p-6 flex flex-col items-center text-center gap-4">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 text-3xl font-extrabold uppercase shadow-inner">
            {user ? user.email.substring(0, 2) : "US"}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100 font-sans">{user ? user.email : "investigator@fraudsense.com"}</h3>
            <span className="text-xs text-slate-400 font-mono mt-1 block">
              Investigator ID: ID-{(user ? user.id : 0) * 1000 + 49}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <span className="soc-badge soc-badge-info">
              {getUserRole()}
            </span>
            {isAnalyst() && (
              <span className="soc-badge soc-badge-low">
                ANALYST GUARD
              </span>
            )}
          </div>
        </div>

        {/* Security Access Details */}
        <div className="md:col-span-2 soc-card p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <Shield className="h-4 w-4 text-blue-400" />
              Security Clearances & Privileges
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AUTHORIZED RBAC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
              <Award className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block uppercase tracking-wider font-mono text-[11px]">System Scope</span>
                <span className="text-slate-400 mt-1.5 block leading-relaxed">
                  {isAdmin()
                    ? "Full read/write permissions for infrastructure configurations, model drift diagnostics, case escalations, and database management."
                    : isAnalyst()
                    ? "Read/write permissions for flagged fraud queues, transaction evaluations, and watchlist records."
                    : "Standard read-only telemetry viewing on dashboard and public feeds."}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
              <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block uppercase tracking-wider font-mono text-[11px]">Session Policy</span>
                <span className="text-slate-400 mt-1.5 block leading-relaxed">
                  Cryptographic JWT token authentication. Auto-refresh and revocation parameters are governed by enterprise administrative policies.
                </span>
              </div>
            </div>
          </div>

          {token && (
            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-2 font-mono">
                <Key className="h-4 w-4 text-slate-500" />
                Active JWT Bearer Token Signature
              </span>
              <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-850 text-[11px] font-mono text-slate-400 break-all select-all leading-normal max-h-24 overflow-y-auto">
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
