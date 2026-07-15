import { useState } from "react";
import TransactionService from "../services/transaction.services";
import { useTransactionStore } from "../store/TransactionStore";

export function useFraudScore() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fetchHistory = useTransactionStore((state) => state.fetchHistory);

  const scoreTransaction = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await TransactionService.scoreTransaction(payload);
      setResult(data);
      await fetchHistory();
      setLoading(false);
      return { success: true, data };
    } catch (e) {
      setError(e.message || "Failed to score transaction");
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  const uploadCSV = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await TransactionService.uploadCSV(file);
      await fetchHistory();
      setLoading(false);
      return { success: true, data };
    } catch (e) {
      setError(e.message || "Failed to upload CSV");
      setLoading(false);
      return { success: false, error: e.message };
    }
  };

  return {
    loading,
    result,
    error,
    scoreTransaction,
    uploadCSV,
  };
}
