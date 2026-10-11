import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { formatCurrency } from "../../utils/formatcurrency";
import { formatDate } from "../../utils/FormatDate";
import { getRiskColorClass } from "../../utils/riskColor";
import { ShieldCheck, Eye } from "lucide-react";

export function TransactionTable({ transactions = [], onSelect }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-950/40 rounded-xl border border-slate-850">
        <ShieldCheck className="h-8 w-8 text-emerald-400 mb-2" />
        <span className="text-sm font-semibold text-slate-200">No Transaction Records</span>
        <span className="text-xs text-slate-500 mt-0.5">Execution logs will populate automatically as inferences run.</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Charge Amount</TableHead>
          <TableHead>Risk Classification</TableHead>
          <TableHead>Fraud Score</TableHead>
          <TableHead>Audit Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-mono font-bold text-slate-200">TX-{tx.id}</TableCell>
            <TableCell className="font-mono text-slate-400 text-[11px]">{formatDate(tx.created_at)}</TableCell>
            <TableCell className="font-mono font-bold text-slate-100">{formatCurrency(tx.amount)}</TableCell>
            <TableCell>
              <span className={`soc-badge ${getRiskColorClass(tx.risk_level)}`}>
                {tx.risk_level}
              </span>
            </TableCell>
            <TableCell className="font-mono font-bold text-slate-200">{(tx.fraud_probability * 100).toFixed(1)}%</TableCell>
            <TableCell>
              <span className={`text-xs font-mono font-semibold ${tx.status === 'APPROVED' ? 'text-emerald-400' : tx.status === 'FLAGGED_FRAUD' ? 'text-red-400' : 'text-slate-400'}`}>
                {tx.audited_by ? tx.status : "Awaiting Audit"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <button
                onClick={() => onSelect && onSelect(tx)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded border border-slate-800 cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                <span>Inspect</span>
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TransactionTable;
