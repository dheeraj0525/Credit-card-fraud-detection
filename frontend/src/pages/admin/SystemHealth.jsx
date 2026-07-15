import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Activity, Server, Cpu, Database, RefreshCw, Layers } from "lucide-react";

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
    
    // Set up polling for system metrics every 5 seconds
    const interval = setInterval(() => {
      fetchHealthFeeds();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">System Performance Uptime</h1>
          <p className="text-sm text-slate-400">Observability metrics and live audit trace logs of API execution status.</p>
        </div>
        <button
          onClick={fetchHealthFeeds}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-slate-300 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Poll Feeds
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading observability console...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">API Uptime</span>
                <span className="text-xl font-bold text-slate-100 block mt-1">
                  {Math.floor(metrics.uptime_seconds / 3600)}h {Math.floor((metrics.uptime_seconds % 3600) / 60)}m
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">CPU Load</span>
                <span className="text-xl font-bold text-slate-100 block mt-1">{metrics.cpu_usage_pct}%</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Cpu className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">RAM Util.</span>
                <span className="text-xl font-bold text-slate-100 block mt-1">{metrics.memory_usage_pct}%</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Avg ML Latency</span>
                <span className="text-xl font-bold text-slate-100 block mt-1">{metrics.avg_ml_inference_latency_ms} ms</span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Audit Logs and System State */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* System Status Info Card */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Service Health Parameters
              </h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                  <span className="text-slate-400 font-medium">Gateway Service State</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    ONLINE (UP)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                  <span className="text-slate-400 font-medium">Active Classifier</span>
                  <span className="font-mono text-slate-300 font-bold">{health.ml_model}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                  <span className="text-slate-400 font-medium">Model Status</span>
                  <span className="text-emerald-400 font-bold">READY / COMPILING</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
                  <span className="text-slate-400 font-medium">Active Session Keys</span>
                  <span className="font-bold text-slate-300">{metrics.active_sessions_count} sessions</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400 font-medium">Total API Inferences</span>
                  <span className="font-bold text-slate-300">{metrics.total_requests_processed} executions</span>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-500" />
                System Audit Trail Logs
              </h3>

              <div className="overflow-y-auto max-h-[300px] pr-1">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No system audit logs found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Log ID</TableHead>
                        <TableHead>Action Description</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-semibold text-slate-400">LOG-{log.id}</TableCell>
                          <TableCell className="text-slate-200 text-xs">{log.action}</TableCell>
                          <TableCell className="text-slate-500 font-mono text-[10px]">
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
