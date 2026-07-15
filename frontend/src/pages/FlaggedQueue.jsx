import React, { useEffect, useState } from "react";
import { useTransactionStore } from "../store/TransactionStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { formatCurrency } from "../utils/formatcurrency";
import { formatDate } from "../utils/FormatDate";
import { getRiskColorClass } from "../utils/riskColor";
import { ShieldAlert, User, Edit, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function FlaggedQueue() {
  const { cases, fetchCases, updateCaseStatus, loading, error } = useTransactionStore();
  const { user } = useAuth();
  
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form Inputs
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

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
        return <Badge variant="danger">OPEN</Badge>;
      case "UNDER_INVESTIGATION":
        return <Badge variant="warning">UNDER REVIEW</Badge>;
      case "CLOSED_RESOLVED":
        return <Badge variant="success">RESOLVED (GENUINE)</Badge>;
      case "CLOSED_FRAUD":
        return <Badge variant="danger">CONFIRMED FRAUD</Badge>;
      default:
        return <Badge>{st}</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Fraud Flagged Queue</h1>
        <p className="text-sm text-slate-400">Review, assign, and resolve automated High-risk fraud alerts and investigator cases.</p>
      </div>

      {/* Main Queue Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
        <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          Active Cases List
        </h3>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading active cases list...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No active flagged cases pending review. System secure.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fraud Score</TableHead>
                <TableHead>Case Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-slate-200">CASE-{c.id}</TableCell>
                  <TableCell className="font-mono">TX-{c.transaction_id}</TableCell>
                  <TableCell className="text-slate-300 font-mono text-xs">{c.assigned_to || "Unassigned"}</TableCell>
                  <TableCell className="font-bold text-slate-100">{formatCurrency(c.amount)}</TableCell>
                  <TableCell className="font-mono text-red-400 font-bold">{(c.fraud_probability * 100).toFixed(1)}%</TableCell>
                  <TableCell>{getCaseStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleOpenReview(c)}
                      className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded flex items-center gap-1.5 ml-auto border border-slate-750 cursor-pointer transition-all hover:text-blue-300"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Review
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Review Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCase ? `Review Case: CASE-${selectedCase.id} (TX-${selectedCase.transaction_id})` : "Review Case"}
      >
        <form onSubmit={handleSaveCase} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Assign Investigator Email</label>
              <input
                type="email"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Review Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                <option value="CLOSED_RESOLVED">CLOSED (False Alarm / Resolved)</option>
                <option value="CLOSED_FRAUD">CLOSED (Confirmed Fraud Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Investigation Audit Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none h-24 resize-none font-sans"
              placeholder="Provide evidence logs or closure notes..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-700 text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded text-sm cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold cursor-pointer transition-colors"
            >
              {saving ? "Saving review..." : "Commit Review Settings"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FlaggedQueue;
