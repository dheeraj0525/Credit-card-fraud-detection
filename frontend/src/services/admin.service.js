import API from "./api";

const AdminService = {
  // Users Control
  getUsers: async () => {
    const response = await API.get("/api/users/");
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await API.put(`/api/users/${userId}/block`);
    return response.data;
  },

  // Observability & System Monitoring
  getSystemMetrics: async () => {
    const response = await API.get("/api/monitoring/metrics");
    return response.data;
  },

  getInAppNotifications: async () => {
    const response = await API.get("/api/monitoring/notifications");
    return response.data;
  },

  markNotificationRead: async (notifId) => {
    const response = await API.put(`/api/monitoring/notifications/${notifId}/read`);
    return response.data;
  },

  // Configurations (SMTP, Thresholds)
  getSystemConfig: async () => {
    const response = await API.get("/api/config");
    return response.data;
  },

  updateSystemConfig: async (config) => {
    const response = await API.put("/api/config", config);
    return response.data;
  },

  // Auditing & Rules
  getAuditLogs: async () => {
    const response = await API.get("/api/admin/audit-logs");
    return response.data;
  },

  getFraudRules: async () => {
    const response = await API.get("/api/admin/fraud-rules");
    return response.data;
  },

  // Model & Performance Monitoring
  getModelDrift: async () => {
    const response = await API.get("/api/model-monitoring/drift");
    return response.data;
  },

  getModelPerformance: async () => {
    const response = await API.get("/api/admin/model-performance");
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await API.get("/api/admin/health");
    return response.data;
  }
};

export default AdminService;
