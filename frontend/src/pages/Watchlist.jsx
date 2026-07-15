import React, { useEffect, useState } from "react";
import TransactionService from "../services/transaction.services";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { formatDate } from "../utils/FormatDate";
import { Eye, UserX, Plus, AlertCircle, Trash2 } from "lucide-react";

export function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form input state
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TransactionService.getWatchlist();
      setWatchlist(data);
    } catch (e) {
      setError(e.message || "Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!identifier || !reason) return;
    setSubmitting(true);
    try {
      await TransactionService.addToWatchlist(identifier, reason);
      setIdentifier("");
      setReason("");
      fetchList();
    } catch (e) {
      setError(e.message || "Failed to add to watchlist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this identifier from the watchlist?")) return;
    try {
      await TransactionService.deleteFromWatchlist(id);
      fetchList();
    } catch (e) {
      setError(e.message || "Failed to delete watchlist entry");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Security Watchlist</h1>
        <p className="text-sm text-slate-400">Manage card identifiers, customer emails, or locations flagged for immediate security alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Watchlist Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Watchlist Database Records
          </h3>

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading security database...</div>
          ) : watchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-slate-650" />
              <span>No identifiers on the watchlist.</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Reason / Flag Detail</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-slate-200 font-mono">{item.identifier}</TableCell>
                    <TableCell className="text-slate-300">{item.reason}</TableCell>
                    <TableCell>{formatDate(item.added_at)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1.5 rounded bg-slate-950 border border-slate-850 hover:border-red-500/20 cursor-pointer"
                        title="Delete from Watchlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Add Entry Card */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-500" />
            Add To Watchlist
          </h3>

          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Target Identifier</label>
              <input
                type="text"
                placeholder="e.g. customer@fraudster.com or card token"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Reason for Flagging</label>
              <textarea
                placeholder="Audit notes or investigation trigger..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none h-20 resize-none font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              {submitting ? "Adding..." : "Add to Watchlist"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
