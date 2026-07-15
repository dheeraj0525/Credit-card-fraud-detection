import { create } from "zustand";
import TransactionService from "../services/transaction.services";

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  cases: [],
  loading: false,
  error: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const data = await TransactionService.getTransactionHistory();
      set({ transactions: data, loading: false });
    } catch (e) {
      set({ error: e.message || "Failed to load transactions", loading: false });
    }
  },

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const data = await TransactionService.getCases();
      set({ cases: data, loading: false });
    } catch (e) {
      set({ error: e.message || "Failed to load cases", loading: false });
    }
  },

  updateCaseStatus: async (caseId, payload) => {
    try {
      await TransactionService.updateCase(caseId, payload);
      await get().fetchCases();
      await get().fetchHistory();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || "Update case failed" };
    }
  }
}));
