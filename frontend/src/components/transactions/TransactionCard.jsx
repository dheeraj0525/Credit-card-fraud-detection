import React from "react";
import { formatCurrency } from "../../utils/formatcurrency";
import { formatDate } from "../../utils/FormatDate";
import { getRiskColorClass } from "../../utils/riskColor";

export function TransactionCard({ transaction, onReview }) {
  if (!transaction) return null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-400">Transaction ID</h4>
          <p className="text-lg font-bold text-slate-100">TX-{transaction.id}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRiskColorClass(transaction.risk_level)}`}>
          {transaction.risk_level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500 block">Amount</span>
          <span className="font-bold text-slate-200">{formatCurrency(transaction.amount)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Date</span>
          <span className="text-slate-200">{formatDate(transaction.created_at)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Fraud Score</span>
          <span className="font-bold text-slate-200">{(transaction.fraud_probability * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">Audited By</span>
          <span className="text-slate-200 truncate block">{transaction.audited_by || "Pending Review"}</span>
        </div>
      </div>

      {transaction.comments && (
        <div className="border-t border-slate-800 pt-3 text-xs">
          <span className="text-slate-500 block mb-1">Analyst Notes</span>
          <p className="text-slate-300 italic bg-slate-950 p-2 rounded">{transaction.comments}</p>
        </div>
      )}

      {onReview && (
        <button
          onClick={() => onReview(transaction)}
          className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors cursor-pointer"
        >
          Review Transaction
        </button>
      )}
    </div>
  );
}

export default TransactionCard;
