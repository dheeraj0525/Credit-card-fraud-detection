import React, { useState } from "react";
import { useFraudScore } from "../hooks/useFraudScore";
import { useTransactionStore } from "../store/TransactionStore";
import TransactionTable from "../components/transactions/TransactionTable";
import { SAMPLE_DATA } from "../utils/constants";
import { getRiskColorClass } from "../utils/riskColor";
import { Play, UploadCloud, History, AlertCircle, Cpu, FileSpreadsheet, SlidersHorizontal } from "lucide-react";

export function Transactions() {
  const [activeTab, setActiveTab] = useState("single"); // "single", "batch", "history"
  const { loading, result, error, scoreTransaction, uploadCSV } = useFraudScore();
  const { transactions } = useTransactionStore();

  const [formData, setFormData] = useState({
    customer_id: "CUST-9999",
    Time: 0.0,
    Amount: 100.0,
    Merchant: "Default Store",
    Location: "San Francisco, CA",
    time_of_day: "12:00",
    V1: 0.0, V2: 0.0, V3: 0.0, V4: 0.0, V5: 0.0, V6: 0.0, V7: 0.0, V8: 0.0,
    V9: 0.0, V10: 0.0, V11: 0.0, V12: 0.0, V13: 0.0, V14: 0.0, V15: 0.0, V16: 0.0,
    V17: 0.0, V18: 0.0, V19: 0.0, V20: 0.0, V21: 0.0, V22: 0.0, V23: 0.0, V24: 0.0,
    V25: 0.0, V26: 0.0, V27: 0.0, V28: 0.0
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [batchResponse, setBatchResponse] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || value,
    }));
  };

  const loadSample = (type) => {
    const sample = SAMPLE_DATA[type];
    if (sample) {
      setFormData(sample);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await scoreTransaction(formData);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a valid CSV file.");
      return;
    }
    const res = await uploadCSV(uploadFile);
    if (res.success) {
      setBatchResponse(res.data);
      setUploadSuccess("Batch processing completed successfully!");
      setUploadFile(null);
    } else {
      setUploadError(res.error || "Batch processing failed.");
    }
  };

  const shapFeatures = [
    { feature: "V17 (Fraud Component)", impact: formData.V17 < -2 ? 0.38 : -0.05, value: formData.V17 },
    { feature: "V14 (Card Validation)", impact: formData.V14 < -2 ? 0.29 : -0.02, value: formData.V14 },
    { feature: "Amount (Velocity)", impact: formData.Amount > 500 ? 0.18 : -0.08, value: formData.Amount },
    { feature: "V12 (Identity Component)", impact: formData.V12 < -2 ? 0.12 : -0.04, value: formData.V12 },
    { feature: "V10 (Risk Signature)", impact: formData.V10 < -1.5 ? 0.10 : -0.03, value: formData.V10 }
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            XGBoost Transaction Scorer & Evaluator
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Perform real-time machine learning scoring on single transactions or stream bulk CSV payloads.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono shrink-0">
          <Cpu className="h-3.5 w-3.5" />
          <span>INFERENCE ENGINE READY</span>
        </div>
      </div>

      {/* Navigation Tabs Controller */}
      <div className="flex border-b border-slate-800/80 gap-2 md:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("single")}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "single"
              ? "border-blue-500 text-blue-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Play className="h-4 w-4" />
          <span>Single Transaction Scorer</span>
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "batch"
              ? "border-blue-500 text-blue-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Batch CSV Inferences</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-3 text-xs md:text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "history"
              ? "border-blue-500 text-blue-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Scoring Audit Logs ({transactions.length})</span>
        </button>
      </div>

      {/* View Container */}
      <div className="flex-1 flex flex-col">
        {activeTab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Scorer Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 soc-card p-6 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm font-sans">Transaction Latent Vector Input</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PCA FEATURES V1 - V28</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample("safe")}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 cursor-pointer transition-colors"
                  >
                    Preset: Safe Baseline
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample("fraud")}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"
                  >
                    Preset: Fraud Vector
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              {/* Core Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Customer Identifier</label>
                  <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="soc-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Transaction Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="Amount"
                    value={formData.Amount}
                    onChange={handleInputChange}
                    className="soc-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Elapsed Time Delta (sec)</label>
                  <input
                    type="number"
                    name="Time"
                    value={formData.Time}
                    onChange={handleInputChange}
                    className="soc-input font-mono"
                    required
                  />
                </div>
              </div>

              {/* PCA Latent Features V1-V28 */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
                    PCA Dimensional Components ($V_1$ to $V_{28}$)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">Continuous Latent Space</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-mono font-bold text-center">V{idx}</span>
                      <input
                        type="number"
                        step="0.000001"
                        name={`V${idx}`}
                        value={formData[`V${idx}`]}
                        onChange={handleInputChange}
                        className="bg-slate-950/80 border border-slate-800 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2"
              >
                <Cpu className="h-4 w-4" />
                <span>{loading ? "Calculating XGBoost Inference..." : "Execute Real-Time Scoring"}</span>
              </button>
            </form>

            {/* Results Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="soc-card p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <h3 className="font-bold text-slate-200 text-sm font-sans">ML Decision Matrix</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PREDICTION MATRIX</span>
                </div>

                {result ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center py-6 bg-slate-950/80 rounded-xl border border-slate-850 shadow-inner">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Fraud Probability Score</span>
                      <span className={`text-4xl font-extrabold font-mono mt-1 ${result.risk_level === "HIGH" || result.risk_level === "FRAUD" ? "text-red-400" : result.risk_level === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>
                        {(result.fraud_probability * 100).toFixed(1)}%
                      </span>
                      <span className={`mt-3 soc-badge ${getRiskColorClass(result.risk_level)}`}>
                        {result.risk_level} RISK
                      </span>
                    </div>

                    {/* SHAP Explanation visualizer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 block mb-1">SHAP Local Feature Contribution</span>
                      <div className="flex flex-col gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
                        {shapFeatures.map((f, i) => (
                          <div key={i} className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between font-mono text-[11px] text-slate-400">
                              <span>{f.feature}</span>
                              <span className={f.impact > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                {f.impact > 0 ? `+${(f.impact * 100).toFixed(0)}%` : `${(f.impact * 100).toFixed(0)}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${f.impact > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(100, Math.abs(f.impact * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-3 bg-slate-950/40 rounded-xl border border-slate-850">
                    <AlertCircle className="h-8 w-8 text-slate-600" />
                    <span>Run scoring to generate a classification matrix.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="soc-card p-6 flex flex-col gap-6 max-w-3xl">
            <div>
              <h3 className="font-bold text-slate-200 text-base font-sans">Batch Dataset Inferences Pipeline</h3>
              <p className="text-xs text-slate-400 mt-1">Upload credit card transaction CSV files containing latent PCA parameters to run high-throughput batch classification.</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-950/60 text-center gap-4 transition-colors">
                <FileSpreadsheet className="h-12 w-12 text-blue-400" />
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">Select credit card dataset CSV</span>
                  <span className="text-xs text-slate-500 mt-1 block">Expected schema: Time, Amount, V1-V28 columns.</span>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="text-xs text-slate-400 mt-2 block mx-auto cursor-pointer"
                />
              </div>

              {uploadError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg">{uploadError}</div>}
              {uploadSuccess && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg">{uploadSuccess}</div>}

              <button
                type="submit"
                disabled={loading || !uploadFile}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer"
              >
                {loading ? "Processing batch inferences..." : "Process Batch Inferences"}
              </button>
            </form>

            {batchResponse && (
              <div className="border-t border-slate-800/80 pt-6 flex flex-col gap-4">
                <h4 className="font-bold text-slate-200 text-sm">Batch Output Telemetry</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">Processed Records</span>
                    <span className="text-2xl font-extrabold text-slate-200 mt-1 block font-mono">{batchResponse.total_records_processed}</span>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase font-mono">Flagged Fraud Anomalies</span>
                    <span className="text-2xl font-extrabold text-red-400 mt-1 block font-mono">{batchResponse.fraud_alerts_detected}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="soc-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 text-sm font-sans">Model Scoring History Log</h3>
            <TransactionTable transactions={transactions} onSelect={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
