import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Badge } from "../../components/ui/Badge";
import { Cpu, ShieldAlert, CheckCircle, RefreshCw, BarChart, Settings, Sliders, Activity } from "lucide-react";

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
      setSuccess("Model configurations saved successfully!");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            Model Governance & Drift Diagnostics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track feature stability via Population Stability Index (PSI), inspect confusion matrices, and calibrate decision limits.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
          <Activity className="h-3.5 w-3.5 text-blue-400" />
          <span>CLASSIFIER: {perf.version}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
          <span className="text-xs text-slate-400 font-mono">Loading model telemetry...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Diagnostics and Confusion Matrix */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Model Performance */}
            <div className="soc-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  Active Classifier Performance Matrix
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">VALIDATION BENCHMARK</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">AUC-ROC</span>
                  <span className="text-2xl font-extrabold text-slate-100 mt-1 block font-mono">{(perf.roc_auc * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">Precision</span>
                  <span className="text-2xl font-extrabold text-slate-100 mt-1 block font-mono">{(perf.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">Recall</span>
                  <span className="text-2xl font-extrabold text-slate-100 mt-1 block font-mono">{(perf.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">Accuracy</span>
                  <span className="text-2xl font-extrabold text-slate-100 mt-1 block font-mono">{(perf.accuracy * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* Confusion Matrix visualizer */}
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Confusion Matrix Classification Counts</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-400">True Positives (TP)</span>
                    <span className="text-emerald-400 font-bold">{perf.confusion_matrix.tp}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-400">False Positives (FP)</span>
                    <span className="text-red-400 font-bold">{perf.confusion_matrix.fp}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-400">False Negatives (FN)</span>
                    <span className="text-red-400 font-bold">{perf.confusion_matrix.fn}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex justify-between items-center">
                    <span className="text-slate-400">True Negatives (TN)</span>
                    <span className="text-emerald-400 font-bold">{perf.confusion_matrix.tn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Drift Metric (PSI) */}
            <div className="soc-card p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
                  <BarChart className="h-4 w-4 text-amber-400" />
                  Feature Population Stability Index (PSI)
                </h3>
                <span className={`soc-badge ${drift.drift_detected ? "soc-badge-high" : "soc-badge-low"}`}>
                  PSI: {drift.overall_psi} ({drift.status})
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous drift monitoring on latent dimensions ($V_1-V_{28}$). PSI &gt; 0.10 indicates moderate feature decay; PSI &gt; 0.25 indicates significant distribution shift requiring retraining.
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 mt-2">
                {Object.entries(drift.feature_metrics).map(([feat, val]) => (
                  <div key={feat} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 text-center flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{feat}</span>
                    <span className={`text-xs font-bold font-mono ${val >= 0.25 ? "text-red-400" : val >= 0.10 ? "text-amber-400" : "text-slate-300"}`}>
                      {val.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Configurations Form */}
          <div className="lg:col-span-1 soc-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
                <Settings className="h-4 w-4 text-indigo-400" />
                Model Configuration Controls
              </h3>
            </div>

            {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg">{error}</div>}
            {success && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg">{success}</div>}

            <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  Decision Fraud Probability Threshold
                </span>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  name="fraud_threshold"
                  value={config.fraud_threshold}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between items-center text-xs font-bold font-mono mt-1 text-slate-300">
                  <span>Operating Cutoff</span>
                  <span className="text-blue-400">{(config.fraud_threshold * 100).toFixed(0)}% Threshold</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">SMTP Security Alerts Host</label>
                <input
                  type="text"
                  name="smtp_host"
                  value={config.smtp_host}
                  onChange={handleInputChange}
                  className="soc-input font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">SMTP Port</label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={config.smtp_port}
                    onChange={handleInputChange}
                    className="soc-input font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Session timeout (min)</label>
                  <input
                    type="number"
                    name="session_timeout_minutes"
                    value={config.session_timeout_minutes}
                    onChange={handleInputChange}
                    className="soc-input font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Security Mode Flag</label>
                <select
                  name="security_mode"
                  value={config.security_mode}
                  onChange={handleInputChange}
                  className="soc-input text-xs"
                >
                  <option value="LOW">LOW SECURITY (Relaxed threshold)</option>
                  <option value="MEDIUM">MEDIUM SECURITY (Standard enforcement)</option>
                  <option value="HIGH">HIGH SECURITY (Enforced JWT rate-limits)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md"
              >
                {saving ? "Commiting settings..." : "Commit Model Configurations"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelManagement;
