import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Badge } from "../../components/ui/Badge";
import { Cpu, ShieldAlert, CheckCircle, RefreshCw, BarChart, Settings, Sliders } from "lucide-react";

export function ModelManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drift, setDrift] = useState({
    status: "STABLE",
    overall_psi: 0,
    drift_detected: false,
    feature_metrics: {}
  });

  const [perf, setPerf] = useState({
    version: "xgboost_v1.pkl",
    roc_auc: 0.965,
    accuracy: 0.999,
    precision: 0.887,
    recall: 0.825,
    confusion_matrix: { tp: 85, fn: 15, fp: 11, tn: 56860 }
  });

  // Config settings form inputs
  const [config, setConfig] = useState({
    fraud_threshold: 0.50,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    session_timeout_minutes: 60,
    security_mode: "HIGH"
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchModelFeeds = async () => {
    try {
      const driftRes = await AdminService.getModelDrift();
      setDrift(driftRes);

      const perfRes = await AdminService.getModelPerformance();
      setPerf(perfRes);

      const configRes = await AdminService.getSystemConfig();
      setConfig(configRes);
    } catch (e) {
      console.error("Failed to load model diagnostics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelFeeds();
  }, []);

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await AdminService.updateSystemConfig(config);
      setSuccess("Configurations saved successfully!");
    } catch (e) {
      setError(e.message || "Failed to update configurations.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "fraud_threshold" ? parseFloat(value) : name === "smtp_port" || name === "session_timeout_minutes" ? parseInt(value) : value
    }));
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">Model Diagnostics & Controls</h1>
        <p className="text-sm text-slate-400">Monitor model decay via Population Stability Index (PSI) and adjust decision limits configuration.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading model control panel...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Diagnostics and Confusion Matrix */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Model Performance */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                Active Classifier Performance Matrix
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-950 p-4 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">AUC-ROC</span>
                  <span className="text-2xl font-bold text-slate-200 mt-1 block">{(perf.roc_auc * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Precision</span>
                  <span className="text-2xl font-bold text-slate-200 mt-1 block">{(perf.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Recall</span>
                  <span className="text-2xl font-bold text-slate-200 mt-1 block">{(perf.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Accuracy</span>
                  <span className="text-2xl font-bold text-slate-200 mt-1 block">{(perf.accuracy * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* Confusion Matrix visualizer */}
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Confusion Matrix Elements</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-500">True Positives (TP)</span>
                    <span className="text-emerald-400 font-bold">{perf.confusion_matrix.tp}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-500">False Positives (FP)</span>
                    <span className="text-red-400 font-bold">{perf.confusion_matrix.fp}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-500">False Negatives (FN)</span>
                    <span className="text-red-400 font-bold">{perf.confusion_matrix.fn}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-500">True Negatives (TN)</span>
                    <span className="text-emerald-400 font-bold">{perf.confusion_matrix.tn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Drift Metric (PSI) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-amber-500" />
                  Feature Population Stability Index (PSI)
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-xxs font-bold border ${drift.drift_detected ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"}`}>
                  Overall Status: {drift.status} (PSI: {drift.overall_psi})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PSI metrics monitors feature drift comparing real-time inference inputs (V1-V28) to baseline training samples. PSI &gt; 0.10 indicates moderate drift, and PSI &gt; 0.25 indicates significant feature distribution shift.
              </p>

              {/* Grid representation of PCA feature drifts */}
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-2">
                {Object.entries(drift.feature_metrics).map(([feat, val]) => (
                  <div key={feat} className="bg-slate-950 p-2.5 rounded border border-slate-850 text-center flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">{feat}</span>
                    <span className={`text-xs font-bold font-mono ${val >= 0.25 ? "text-red-500" : val >= 0.10 ? "text-amber-500" : "text-slate-300"}`}>
                      {val.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Configurations Form */}
          <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-500" />
              Model Configuration Controls
            </h3>

            {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}
            {success && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded">{success}</div>}

            <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-850 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  Decision Fraud Threshold
                </span>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  name="fraud_threshold"
                  value={config.fraud_threshold}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 accent-blue-500"
                />
                <div className="flex justify-between items-center text-xs font-bold font-mono mt-1 text-slate-300">
                  <span>Sensitivity Mode</span>
                  <span className="text-blue-400">{(config.fraud_threshold * 100).toFixed(0)}% Probability</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">SMTP Alerts Mail Server Host</label>
                <input
                  type="text"
                  name="smtp_host"
                  value={config.smtp_host}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">SMTP Port</label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={config.smtp_port}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Session timeout (min)</label>
                  <input
                    type="number"
                    name="session_timeout_minutes"
                    value={config.session_timeout_minutes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Security Mode Flag</label>
                <select
                  name="security_mode"
                  value={config.security_mode}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="LOW">LOW SECURITY (Relaxed rules)</option>
                  <option value="MEDIUM">MEDIUM SECURITY (Standard audits)</option>
                  <option value="HIGH">HIGH SECURITY (Enforced rate-limits & JWT guards)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                {saving ? "Commiting settings..." : "Commit Configurations"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelManagement;
