import React, { useEffect, useState, useCallback } from "react";
import TransactionService from "../services/transaction.services";
import { useTransactionStore } from "../store/TransactionStore";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import FraudTrendChart from "../components/charts/fraudTrendChart";
import { formatCurrency } from "../utils/formatcurrency";
import { formatDate } from "../utils/FormatDate";
import { getRiskColorClass } from "../utils/riskColor";
import { ShieldAlert, RefreshCw, Layers, Activity, ArrowUpRight, ShieldCheck } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState({
    total_transactions: 0,
    high_risk_transactions: 0,
    average_fraud_probability: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const transactions = useTransactionStore((state) => state.transactions);
  const fetchHistory = useTransactionStore((state) => state.fetchHistory);

  const loadData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsData = await TransactionService.getStats();
      setStats(statsData);
      await fetchHistory();
    } catch (e) {
      console.error("Failed to load dashboard statistics:", e);
    } finally {
      setLoadingStats(false);
    }
  }, [fetchHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentAlerts = transactions.filter((t) => t.risk_level === "HIGH" || t.risk_level === "FRAUD").slice(0, 8);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            Live Security Operations Center
            <span className="live-status-dot"></span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time XGBoost ML-driven transaction risk classification & telemetry stream.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loadingStats}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer text-slate-300 hover:text-white shrink-0 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? "animate-spin text-blue-400" : ""}`} />
          <span>{loadingStats ? "Updating Feeds..." : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Evaluated */}
        <div className="soc-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Evaluated</span>
              {loadingStats ? (
                <div className="h-9 w-24 skeleton-loader mt-2"></div>
              ) : (
                <span className="text-3xl font-extrabold text-slate-100 font-sans mt-1 tracking-tight">
                  {stats.total_transactions.toLocaleString()}
                </span>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Inference pipeline events</span>
            <span className="text-blue-400 font-bold flex items-center gap-0.5">
              100% Logged <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Flagged Fraud Alerts */}
        <div className="soc-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Flagged Fraud Alerts</span>
              {loadingStats ? (
                <div className="h-9 w-20 skeleton-loader mt-2"></div>
              ) : (
                <span className={`text-3xl font-extrabold font-sans mt-1 tracking-tight ${stats.high_risk_transactions > 0 ? "text-red-400" : "text-slate-100"}`}>
                  {stats.high_risk_transactions.toLocaleString()}
                </span>
              )}
            </div>
            <div className={`h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform ${stats.high_risk_transactions > 0 ? "threat-pulse-badge" : ""}`}>
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Requires analyst audit</span>
            <span className={stats.high_risk_transactions > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
              {stats.high_risk_transactions > 0 ? "Action Required" : "Zero Critical"}
            </span>
          </div>
        </div>

        {/* Card 3: Average Fraud Probability */}
        <div className="soc-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Average Fraud Probability</span>
              {loadingStats ? (
                <div className="h-9 w-24 skeleton-loader mt-2"></div>
              ) : (
                <span className="text-3xl font-extrabold text-slate-100 font-mono mt-1 tracking-tight">
                  {(stats.average_fraud_probability * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Model confidence index</span>
            <span className="text-emerald-400 font-bold">Normal Threshold</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Real-Time Threat Feed */}
        <div className="lg:col-span-1 soc-card p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              Critical Real-Time Threat Feed
            </h3>
            <span className="text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
              LIVE AUDIT
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
            {loadingStats ? (
              <div className="flex flex-col gap-3 py-4">
                <div className="h-16 skeleton-loader w-full"></div>
                <div className="h-16 skeleton-loader w-full"></div>
                <div className="h-16 skeleton-loader w-full"></div>
              </div>
            ) : recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-slate-950/40 rounded-xl border border-slate-800/60 my-2">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-slate-200 text-sm font-sans">No Active High-Risk Threats</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                  System monitoring active transaction streams normally within safe parameters.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  ALL STREAMS GENUINE
                </span>
              </div>
            ) : (
              recentAlerts.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/90 hover:border-red-500/40 transition-all flex justify-between items-start gap-3 shadow-sm group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-400 font-mono font-bold">TX-{tx.id}</span>
                    <span className="text-sm font-bold text-slate-100 font-mono">{formatCurrency(tx.amount)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(tx.created_at)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`soc-badge ${getRiskColorClass(tx.risk_level)}`}>
                      {tx.risk_level}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {(tx.fraud_probability * 100).toFixed(1)}% score
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Columns - Visual Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution Card */}
            <div className="soc-card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm font-sans">Fraud Risk Allocation</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PROPORTIONAL AUDIT</span>
              </div>
              <RiskDistributionChart
                low={stats.total_transactions - stats.high_risk_transactions}
                high={stats.high_risk_transactions}
              />
            </div>

            {/* Fraud Hotspots Card */}
            <div className="soc-card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm font-sans">Evaluator Fraud Trend</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TIME-SERIES CURVE</span>
              </div>
              <FraudTrendChart transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;