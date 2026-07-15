import React, { useState } from "react";
import { useFraudScore } from "../hooks/useFraudScore";
import { useTransactionStore } from "../store/TransactionStore";
import TransactionTable from "../components/transactions/TransactionTable";
import { SAMPLE_DATA } from "../utils/constants";
import { formatCurrency } from "../utils/formatcurrency";
import { getRiskColorClass } from "../utils/riskColor";
import { Play, UploadCloud, History, Layers, Clipboard, AlertCircle } from "lucide-react";

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

  // Generate mock SHAP explainability elements based on current form inputs
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">XGBoost Transaction Scorer</h1>
        <p className="text-sm text-slate-400">Classify individual card charges or process batch CSV payloads through the inference model.</p>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab("single")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === "single"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Play className="h-4 w-4" />
          Single Transaction Scorer
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === "batch"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Batch CSV Upload
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === "history"
              ? "border-blue-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          Evaluation Logs ({transactions.length})
        </button>
      </div>

      {/* View Container */}
      <div className="flex-1 flex flex-col">
        {activeTab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Scorer Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200">Evaluate Parameters</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadSample("safe")}
                    className="px-2.5 py-1 text-xxs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 cursor-pointer"
                  >
                    Template: Safe
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample("fraud")}
                    className="px-2.5 py-1 text-xxs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 cursor-pointer"
                  >
                    Template: Fraud
                  </button>
                </div>
              </div>

              {/* Core Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Customer ID</label>
                  <input
                    type="text"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Charge Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="Amount"
                    value={formData.Amount}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Inference Time Metric</label>
                  <input
                    type="number"
                    name="Time"
                    value={formData.Time}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* PCA Latent Features V1-V28 Toggle */}
              <div className="border-t border-slate-800 pt-4">
                <label className="text-xs font-semibold text-slate-400 block mb-3">
                  PCA Latent Dimension Features (V1 - V28)
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-mono">V{idx}</span>
                      <input
                        type="number"
                        step="0.000001"
                        name={`V${idx}`}
                        value={formData[`V${idx}`]}
                        onChange={handleInputChange}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-center font-mono text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                {loading ? "Computing XGBoost score..." : "Execute Real-Time Scoring"}
              </button>
            </form>

            {/* Results Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Classification Result Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3">ML Decision Matrix</h3>

                {result ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center py-4 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-xxs font-semibold text-slate-500 uppercase tracking-widest">Fraud Probability</span>
                      <span className={`text-4xl font-extrabold font-mono mt-1 ${result.risk_level === "HIGH" ? "text-red-500" : result.risk_level === "MEDIUM" ? "text-amber-500" : "text-emerald-500"}`}>
                        {(result.fraud_probability * 100).toFixed(1)}%
                      </span>
                      <span className={`mt-2 px-3 py-1 rounded text-xs font-bold border ${getRiskColorClass(result.risk_level)}`}>
                        {result.risk_level} RISK
                      </span>
                    </div>

                    {/* SHAP Explanation visualizer */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-400 block mb-1">SHAP Local Feature Contribution</span>
                      <div className="flex flex-col gap-2.5 bg-slate-950 p-3 rounded border border-slate-850">
                        {shapFeatures.map((f, i) => (
                          <div key={i} className="flex flex-col gap-1 text-xxs">
                            <div className="flex justify-between font-mono text-slate-400">
                              <span>{f.feature} (val: {f.value.toFixed(2)})</span>
                              <span className={f.impact > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>
                                {f.impact > 0 ? `+${(f.impact * 100).toFixed(0)}%` : `${(f.impact * 100).toFixed(0)}%`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${f.impact > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.abs(f.impact * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-600" />
                    <span>Run scoring to generate a classification matrix.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-slate-200">Batch Processing Pipeline</h3>
              <p className="text-xs text-slate-400 mt-1">Upload a CSV payload containing credit card transaction features (Amount, Time, V1-V28) to run model inferences in bulk.</p>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 max-w-xl">
              <div className="border-2 border-dashed border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-950/40 text-center gap-3">
                <UploadCloud className="h-10 w-10 text-slate-500" />
                <div>
                  <span className="text-sm font-semibold text-slate-300 block">Select credit card dataset CSV</span>
                  <span className="text-xxs text-slate-500 mt-0.5 block">File must contain Time, Amount, V1-V28 columns. Limit 5000 rows.</span>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="text-xs text-slate-400 mt-2 block mx-auto cursor-pointer"
                />
              </div>

              {uploadError && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{uploadError}</div>}
              {uploadSuccess && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded">{uploadSuccess}</div>}

              <button
                type="submit"
                disabled={loading || !uploadFile}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-sm transition-colors cursor-pointer"
              >
                {loading ? "Processing CSV..." : "Process Batch Inferences"}
              </button>
            </form>

            {batchResponse && (
              <div className="border-t border-slate-800 pt-6 flex flex-col gap-4">
                <h4 className="font-bold text-slate-200">Batch Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-850">
                    <span className="text-xxs text-slate-500 font-semibold block uppercase">Processed Rows</span>
                    <span className="text-2xl font-extrabold text-slate-200 mt-1 block">{batchResponse.total_records_processed}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded border border-slate-850">
                    <span className="text-xxs text-slate-500 font-semibold block uppercase">Fraud Cases Raised</span>
                    <span className="text-2xl font-extrabold text-red-500 mt-1 block">{batchResponse.fraud_alerts_detected}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200">Model Scoring History Log</h3>
            <TransactionTable transactions={transactions} onSelect={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
