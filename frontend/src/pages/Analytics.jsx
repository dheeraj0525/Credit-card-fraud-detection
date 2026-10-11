import React from "react";
import MarchantChart from "../components/charts/MarchantChart";
import GoRiskMap from "../components/charts/GoRiskMap";
import { BarChart, MapPin, Store, Zap, ShieldCheck } from "lucide-react";

export function Analytics() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            Security Analytics Center
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Spatial fraud concentration, high-risk merchant telemetry, and rule heuristic thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
          <span className="live-status-dot"></span>
          <span>AGGREGATE METRICS LIVE</span>
        </div>
      </div>

      {/* Analytics Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: Location Risk Breakdown */}
        <div className="soc-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <MapPin className="h-4 w-4 text-blue-400" />
              Risk Concentration by Geography
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">GEO CLUSTERS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Geographic anomaly density calculated from velocity hops relative to billing coordinates.
          </p>
          <div className="flex-1 min-h-[260px] flex items-center">
            <GoRiskMap />
          </div>
        </div>

        {/* Right Card: Merchant Risk Breakdown */}
        <div className="soc-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <Store className="h-4 w-4 text-amber-400" />
              High-Risk Merchant Profiles
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">RETAIL SECTOR</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Top retail classifications exhibiting elevated anomaly coefficients from confirmed audit cases.
          </p>
          <div className="flex-1 min-h-[260px] flex items-center">
            <MarchantChart />
          </div>
        </div>
      </div>

      {/* Rules Effectiveness Table */}
      <div className="soc-card p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
            <Zap className="h-4 w-4 text-emerald-400" />
            Fraud Detection Rule Thresholds & Heuristics
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">BACKEND PIPELINE</span>
        </div>
        <p className="text-xs text-slate-400">
          Deterministic heuristics evaluating in parallel with XGBoost model inferences to block known fraud vectors.
        </p>

        <div className="overflow-x-auto mt-2">
          <table className="soc-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Rule Name</th>
                <th>Condition Logic</th>
                <th>Probability Boost</th>
                <th className="text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              <tr>
                <td className="font-mono font-bold text-blue-400">RULE-01</td>
                <td className="font-semibold text-slate-200">Excessive Single Amount</td>
                <td className="font-mono text-slate-300">Transaction Amount &gt; $10,000.00</td>
                <td className="font-mono font-bold text-amber-400">+35% Fraud Prob.</td>
                <td className="text-right">
                  <span className="soc-badge soc-badge-low">ACTIVE</span>
                </td>
              </tr>
              <tr>
                <td className="font-mono font-bold text-blue-400">RULE-02</td>
                <td className="font-semibold text-slate-200">Velocity Anomaly</td>
                <td className="font-mono text-slate-300">Impossible physical travel &lt; 1 hour</td>
                <td className="font-mono font-bold text-amber-400">+50% Fraud Prob.</td>
                <td className="text-right">
                  <span className="soc-badge soc-badge-low">ACTIVE</span>
                </td>
              </tr>
              <tr>
                <td className="font-mono font-bold text-blue-400">RULE-03</td>
                <td className="font-semibold text-slate-200">New Merchant Cluster</td>
                <td className="font-mono text-slate-300">Merchant is unvisited in customer history</td>
                <td className="font-mono font-bold text-amber-400">+15% Fraud Prob.</td>
                <td className="text-right">
                  <span className="soc-badge soc-badge-low">ACTIVE</span>
                </td>
              </tr>
              <tr>
                <td className="font-mono font-bold text-blue-400">RULE-04</td>
                <td className="font-semibold text-slate-200">Burst Transaction Frequency</td>
                <td className="font-mono text-slate-300">&gt; 5 transactions in 10-minute window</td>
                <td className="font-mono font-bold text-amber-400">+40% Fraud Prob.</td>
                <td className="text-right">
                  <span className="soc-badge soc-badge-low">ACTIVE</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
