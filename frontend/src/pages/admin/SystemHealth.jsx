import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { Activity, Server, Cpu, Database, RefreshCw, Layers, Radio, CheckCircle2 } from "lucide-react";

export function SystemHealth() {
  const [metrics, setMetrics] = useState({
    cpu_usage_pct: 0,
    memory_usage_pct: 0,
    total_requests_processed: 0,
    error_count: 0,
    active_sessions_count: 0,
    avg_ml_inference_latency_ms: 0,
    uptime_seconds: 0
  });

  const [health, setHealth] = useState({
    api_status: "UP",
    ml_model: "xgboost_v1.pkl",
    version: "1.0.0"
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthFeeds = async () => {
    try {
      const metricRes = await AdminService.getSystemMetrics();
      setMetrics(metricRes);

      const healthRes = await AdminService.getSystemHealth();
      setHealth(healthRes);

      const logsRes = await AdminService.getAuditLogs();
      setAuditLogs(logsRes);
    } catch (e) {
      console.error("Failed to load health indicators:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthFeeds();
    const interval = setInterval(() => {
      fetchHealthFeeds();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            System Observability & Uptime Console
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time infrastructure health, memory/compute utilization, and immutable audit trace logs.
          </p>
        </div>
        <button
          onClick={fetchHealthFeeds}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-colors text-slate-300 cursor-pointer shrink-0 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
          <span>Poll Live Feeds</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
          <span className="text-xs text-slate-400 font-mono">Querying system metrics...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="soc-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">API Uptime</span>
                <span className="text-xl font-extrabold text-slate-100 font-mono block mt-1">
                  {Math.floor(metrics.uptime_seconds / 3600)}h {Math.floor((metrics.uptime_seconds % 3600) / 60)}m
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
            </div>

            <div className="soc-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">CPU Compute Load</span>
                <span className="text-xl font-extrabold text-slate-100 font-mono block mt-1">{metrics.cpu_usage_pct}%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="h-5 w-5" />
              </div>
            </div>

            <div className="soc-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">RAM Utilization</span>
                <span className="text-xl font-extrabold text-slate-100 font-mono block mt-1">{metrics.memory_usage_pct}%</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="soc-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ML Inference Latency</span>
                <span className="text-xl font-extrabold text-slate-100 font-mono block mt-1">{metrics.avg_ml_inference_latency_ms} ms</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Audit Logs and System State */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* System Status Info Card */}
            <div className="lg:col-span-1 soc-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
                  <Database className="h-4 w-4 text-indigo-400" />
                  Service Health State
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LIVE STATUS</span>
              </div>

              <div className="flex flex-col gap-3 text-xs font-mono">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400 font-sans">Gateway Service</span>
                  <span className="soc-badge soc-badge-low">ONLINE (UP)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400 font-sans">Active Classifier</span>
                  <span className="text-slate-200 font-bold">{health.ml_model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400 font-sans">Model Engine</span>
                  <span className="text-emerald-400 font-bold">READY / INFERRING</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                  <span className="text-slate-400 font-sans">Active Sessions</span>
                  <span className="text-slate-200 font-bold">{metrics.active_sessions_count} sessions</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-sans">Total Inferences</span>
                  <span className="text-slate-200 font-bold">{metrics.total_requests_processed} executions</span>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="lg:col-span-2 soc-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
                  <Server className="h-4 w-4 text-blue-400" />
                  System Audit Trail & Event Logs
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">TRACE AUDIT</span>
              </div>

              <div className="overflow-y-auto max-h-[340px] pr-1">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No system audit logs found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event ID</TableHead>
                        <TableHead>Action Description</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-semibold text-slate-400 font-mono text-xs">LOG-{log.id}</TableCell>
                          <TableCell className="text-slate-200 text-xs">{log.action}</TableCell>
                          <TableCell className="text-slate-400 font-mono text-[11px] text-right">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemHealth;
