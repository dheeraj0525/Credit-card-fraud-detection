import React from "react";
import MarchantChart from "../components/charts/MarchantChart";
import GoRiskMap from "../components/charts/GoRiskMap";
import { BarChart, MapPin, Store, HelpCircle } from "lucide-react";

export function Analytics() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">Security Analytics Center</h1>
        <p className="text-sm text-slate-400">Granular intelligence on fraud locations, retail merchants, and behavior anomalies.</p>
      </div>

      {/* Analytics Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Location Risk Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Risk Concentration by Location
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Geographic location clusters computed based on flagged transactions anomalies relative to customer billing addresses.
          </p>
          <div className="flex-1 flex items-center">
            <GoRiskMap />
          </div>
        </div>

        {/* Right Card: Merchant Risk Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-500" />
            High-Risk Merchant Profiles
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Top retail classifications exhibiting anomalous transaction rates. Fraud coefficient updates dynamically according to confirmed case audits.
          </p>
          <div className="flex-1">
            <MarchantChart />
          </div>
        </div>
      </div>

      {/* Rules Effectiveness Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
        <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-emerald-500" />
          Fraud Detection Rule Thresholds
        </h3>
        <p className="text-xs text-slate-400">
          Rule-based heuristics configured on the backend execution layer. These augment the raw XGBoost predictions to block known velocity vectors.
        </p>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3">Boost Factor</th>
                <th className="py-2.5 px-3">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold">RULE-01</td>
                <td className="py-3 px-3">Excessive Single Amount</td>
                <td className="py-3 px-3">Transaction Amount &gt; $10,000.00</td>
                <td className="py-3 px-3 text-amber-400 font-semibold">+35% Fraud Prob.</td>
                <td className="py-3 px-3"><span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">RULE-02</td>
                <td className="py-3 px-3">Velocity Anomaly</td>
                <td className="py-3 px-3">Impossible physical travel within 1 hour</td>
                <td className="py-3 px-3 text-amber-400 font-semibold">+50% Fraud Prob.</td>
                <td className="py-3 px-3"><span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">RULE-03</td>
                <td className="py-3 px-3">New Merchant Cluster</td>
                <td className="py-3 px-3">Merchant is completely unvisited in past</td>
                <td className="py-3 px-3 text-amber-400 font-semibold">+15% Fraud Prob.</td>
                <td className="py-3 px-3"><span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold">RULE-04</td>
                <td className="py-3 px-3">Burst Transactions</td>
                <td className="py-3 px-3">More than 5 transactions in 10 minutes</td>
                <td className="py-3 px-3 text-amber-400 font-semibold">+40% Fraud Prob.</td>
                <td className="py-3 px-3"><span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
