import React, { useEffect, useState } from "react";
import TransactionService from "../services/transaction.services";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { formatDate } from "../utils/FormatDate";
import { Eye, UserX, Plus, AlertCircle, Trash2, ShieldX, Search, ShieldCheck } from "lucide-react";

export function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const filteredWatchlist = watchlist.filter(
    (item) =>
      item.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Security Watchlist & Monitored Entities
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Active card tokens, email identifiers, and entities flagged for instant transaction rejection or security escalation.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
          <span className="live-status-dot"></span>
          <span>{watchlist.length} ENTITIES MONITORED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Watchlist Table */}
        <div className="lg:col-span-2 soc-card p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <Eye className="h-4 w-4 text-blue-400" />
              Monitored Security Entries
            </h3>
            {/* Search Filter UI */}
            <div className="relative w-full sm:w-60">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter identifiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</div>}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
              <span className="text-xs text-slate-400 font-mono">Querying security database...</span>
            </div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-3 bg-slate-950/40 rounded-xl border border-slate-850">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <span>{searchQuery ? "No matching watchlist records found." : "No entities currently on the watchlist."}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target Identifier</TableHead>
                    <TableHead>Reason / Threat Vector</TableHead>
                    <TableHead>Date Logged</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWatchlist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-slate-200 font-mono text-xs">{item.identifier}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{item.reason}</TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">{formatDate(item.added_at)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/30 cursor-pointer"
                          title="Delete from Watchlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Add Entry Card */}
        <div className="lg:col-span-1 soc-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
              <UserX className="h-4 w-4 text-red-400" />
              Flag Entity to Watchlist
            </h3>
          </div>

          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Target Identifier / Token</label>
              <input
                type="text"
                placeholder="e.g. card_token_94821 or user@fraud.io"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="soc-input font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Reason for Surveillance</label>
              <textarea
                placeholder="Audit notes or investigation trigger..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="soc-input h-24 resize-none font-sans text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>{submitting ? "Committing Entry..." : "Add to Watchlist"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
