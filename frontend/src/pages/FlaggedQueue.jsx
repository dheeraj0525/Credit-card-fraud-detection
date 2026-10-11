import React, { useEffect, useState } from "react";
import { useTransactionStore } from "../store/TransactionStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { formatCurrency } from "../utils/formatcurrency";
import { Edit, ShieldCheck, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function FlaggedQueue() {
  const { cases, fetchCases, updateCaseStatus, loading, error } = useTransactionStore();
  const { user } = useAuth();

  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form Inputs
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleOpenReview = (c) => {
    setSelectedCase(c);
    setAssignedTo(c.assigned_to || user.email);
    setStatus(c.status || "OPEN");
    setNotes(c.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveCase = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSaving(true);
    const res = await updateCaseStatus(selectedCase.id, {
      assigned_to: assignedTo,
      status: status,
      notes: notes
    });
    setSaving(false);
    if (res.success) {
      setIsModalOpen(false);
      setSelectedCase(null);
    } else {
      alert(res.error || "Failed to update case");
    }
  };

  const getCaseStatusBadge = (st) => {
    switch (st) {
      case "OPEN":
        return <span className="soc-badge soc-badge-high">OPEN</span>;
      case "UNDER_INVESTIGATION":
        return <span className="soc-badge soc-badge-medium">UNDER REVIEW</span>;
      case "CLOSED_RESOLVED":
        return <span className="soc-badge soc-badge-low">RESOLVED (GENUINE)</span>;
      case "CLOSED_FRAUD":
        return <span className="soc-badge soc-badge-high">CONFIRMED FRAUD</span>;
      default:
        return <span className="soc-badge soc-badge-info">{st}</span>;
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      `CASE-${c.id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `TX-${c.transaction_id}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assigned_to && c.assigned_to.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            Fraud Flagged Queue & Investigation Desk
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Triaged security incidents, analyst case assignments, and conclusive fraud resolutions.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
          <span className="live-status-dot"></span>
          <span>{cases.filter((c) => c.status === "OPEN" || c.status === "UNDER_INVESTIGATION").length} ACTIVE INCIDENTS</span>
        </div>
      </div>

      {/* Main Queue Box */}
      <div className="soc-card p-6 flex flex-col gap-4">
        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "OPEN", "UNDER_INVESTIGATION", "CLOSED_RESOLVED", "CLOSED_FRAUD"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-850"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search case or TX ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</div>}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
            <span className="text-xs text-slate-400 font-mono">Loading investigation cases...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <span>{searchQuery || statusFilter !== "ALL" ? "No cases matching selected filter." : "No active flagged cases pending review. System secure."}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Assigned Analyst</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fraud Probability</TableHead>
                  <TableHead>Case Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-slate-200 text-xs font-mono">CASE-{c.id}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">TX-{c.transaction_id}</TableCell>
                    <TableCell className="text-slate-300 font-mono text-xs">{c.assigned_to || "Unassigned"}</TableCell>
                    <TableCell className="font-bold text-slate-100 font-mono text-xs">{formatCurrency(c.amount)}</TableCell>
                    <TableCell className="font-mono text-red-400 font-bold text-xs">{(c.fraud_probability * 100).toFixed(1)}%</TableCell>
                    <TableCell>{getCaseStatusBadge(c.status)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenReview(c)}
                        className="text-xs font-semibold px-3 py-1 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-lg inline-flex items-center gap-1.5 border border-slate-800 cursor-pointer transition-all shadow-sm"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Review</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Review Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCase ? `Review Incident: CASE-${selectedCase.id} (TX-${selectedCase.transaction_id})` : "Review Case"}
      >
        <form onSubmit={handleSaveCase} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Assigned Investigator</label>
              <input
                type="email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="soc-input font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Investigation Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="soc-input text-xs"
              >
                <option value="OPEN">OPEN (Unresolved)</option>
                <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                <option value="CLOSED_RESOLVED">CLOSED (Resolved Genuine)</option>
                <option value="CLOSED_FRAUD">CLOSED (Confirmed Fraud Vector)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Investigator Audit Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="soc-input h-24 resize-none font-sans text-xs"
              placeholder="Record investigation findings, telemetry anomalies, or closure rationale..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-md"
            >
              {saving ? "Saving changes..." : "Commit Case Resolution"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FlaggedQueue;
