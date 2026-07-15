import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { formatCurrency } from "../../utils/formatcurrency";
import { formatDate } from "../../utils/FormatDate";
import { getRiskColorClass } from "../../utils/riskColor";

export function TransactionTable({ transactions = [], onSelect }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
        No transaction history records found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Fraud Score</TableHead>
          <TableHead>Audit Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-semibold text-slate-200">TX-{tx.id}</TableCell>
            <TableCell>{formatDate(tx.created_at)}</TableCell>
            <TableCell className="font-bold text-slate-100">{formatCurrency(tx.amount)}</TableCell>
            <TableCell>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRiskColorClass(tx.risk_level)}`}>
                {tx.risk_level}
              </span>
            </TableCell>
            <TableCell className="font-mono text-slate-200">{(tx.fraud_probability * 100).toFixed(1)}%</TableCell>
            <TableCell>
              <span className={`text-xs ${tx.status === 'APPROVED' ? 'text-emerald-500' : tx.status === 'FLAGGED_FRAUD' ? 'text-red-500' : 'text-amber-400 font-medium'}`}>
                {tx.audited_by ? `${tx.status}` : "Awaiting Audit"}
              </span>
            </TableCell>
            <TableCell>
              <button
                onClick={() => onSelect(tx)}
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
              >
                Inspect
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TransactionTable;
