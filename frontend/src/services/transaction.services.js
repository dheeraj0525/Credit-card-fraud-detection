import API from "./api";

const TransactionService = {
  getStats: async () => {
    const response = await API.get("/api/stats");
    return response.data;
  },

  scoreTransaction: async (payload) => {
    const response = await API.post("/api/transactions/score", payload);
    return response.data;
  },

  getTransactionHistory: async () => {
    const response = await API.get("/api/transactions/history");
    return response.data;
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post("/api/transactions/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cases Management
  getCases: async () => {
    const response = await API.get("/api/cases");
    return response.data;
  },

  updateCase: async (caseId, payload) => {
    const response = await API.put(`/api/cases/${caseId}`, payload);
    return response.data;
  },

  // Alerts & Watchlist
  getHighRiskAlerts: async () => {
    const response = await API.get("/api/alerts/high-risk");
    return response.data;
  },

  getWatchlist: async () => {
    const response = await API.get("/api/alerts/watchlist");
    return response.data;
  },

  addToWatchlist: async (identifier, reason) => {
    const response = await API.post("/api/alerts/watchlist", { identifier, reason });
    return response.data;
  },

  deleteFromWatchlist: async (id) => {
    const response = await API.delete(`/api/alerts/watchlist/${id}`);
    return response.data;
  },

  // Bank Statement Analysis
  importBankCSV: async (customerId, file) => {
    const formData = new FormData();
    formData.append("customer_id", customerId);
    formData.append("file", file);
    const response = await API.post("/api/bank/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getBankProfiles: async () => {
    const response = await API.get("/api/bank/profiles");
    return response.data;
  },

  getBankProfile: async (customerId) => {
    const response = await API.get(`/api/bank/profiles/${customerId}`);
    return response.data;
  },

  deleteBankData: async (customerId) => {
    const response = await API.delete(`/api/bank/datasets/${customerId}`);
    return response.data;
  }
};

export default TransactionService;
