import React, { useEffect, useState } from "react";
import TransactionService from "../services/transaction.services";
import { useTransactionStore } from "../store/TransactionStore";
import RiskDistributionChart from "../components/charts/RiskDistributionChart";
import FraudTrendChart from "../components/charts/fraudTrendChart";
import { formatCurrency } from "../utils/formatcurrency";
import { formatDate } from "../utils/FormatDate";
import { getRiskColorClass } from "../utils/riskColor";
import { ShieldAlert, RefreshCw, Layers, CheckCircle } from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState({
    total_transactions: 0,
    high_risk_transactions: 0,
    average_fraud_probability: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const { transactions, fetchHistory } = useTransactionStore();

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentAlerts = transactions.filter((t) => t.risk_level === "HIGH").slice(0, 5);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Dashboard Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Live Security Operations Center</h1>
          <p className="text-sm text-slate-400">Real-time XGBoost ML-driven transaction risk classification feeds.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer text-slate-300"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Evaluated</span>
            <span className="text-3xl font-bold text-slate-100 block mt-1">
              {loadingStats ? "..." : stats.total_transactions}
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Flagged Fraud Alerts</span>
            <span className="text-3xl font-bold text-red-500 block mt-1">
              {loadingStats ? "..." : stats.high_risk_transactions}
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Average Fraud Prob.</span>
            <span className="text-3xl font-bold text-slate-100 block mt-1">
              {loadingStats ? "..." : `${(stats.average_fraud_probability * 100).toFixed(1)}%`}
            </span>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts Feed */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Critical Real-Time Feed
          </h3>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
            {recentAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No high-risk transactions flagged. System secure.
              </div>
            ) : (
              recentAlerts.map((tx) => (
                <div key={tx.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold block">ID: TX-{tx.id}</span>
                    <span className="text-base font-bold text-slate-100 mt-0.5 block">{formatCurrency(tx.amount)}</span>
                    <span className="text-xxs text-slate-500 block mt-1">{formatDate(tx.created_at)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskColorClass(tx.risk_level)}`}>
                      {tx.risk_level}
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">{(tx.fraud_probability * 100).toFixed(0)}% score</span>
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
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Fraud Risk Allocation</h3>
              <RiskDistributionChart
                low={stats.total_transactions - stats.high_risk_transactions}
                high={stats.high_risk_transactions}
              />
            </div>

            {/* Fraud Hotspots Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Evaluator Fraud Trend</h3>
              <FraudTrendChart transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;