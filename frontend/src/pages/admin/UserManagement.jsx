import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { Users, ShieldAlert, UserCheck, UserX, AlertCircle, Shield, Key } from "lucide-react";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminService.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message || "Failed to load user accounts list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleBlockUser = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend/block this investigator account?")) return;
    try {
      await AdminService.blockUser(userId);
      fetchUsersList();
    } catch (e) {
      setError(e.message || "Failed to suspend investigator account.");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            Investigator Access & Identity Control
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage authenticated security accounts, grant role elevations, and revoke session authorizations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono shrink-0">
          <Key className="h-3.5 w-3.5 text-blue-400" />
          <span>{users.length} REGISTERED IDENTITIES</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="soc-card p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 font-sans">
            <Users className="h-4 w-4 text-blue-400" />
            Security Personnel Directory
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ADMIN PRIVILEGED</span>
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</div>}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
            <span className="text-xs text-slate-400 font-mono">Loading directory records...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <AlertCircle className="h-8 w-8 text-slate-650" />
            <span>No investigator accounts registered in system.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investigator ID</TableHead>
                  <TableHead>Email Identifier</TableHead>
                  <TableHead>Role Authority</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-right">Access Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-slate-200 font-mono text-xs">ID-{u.id * 1000 + 49}</TableCell>
                    <TableCell className="font-mono text-slate-200 text-xs">{u.email}</TableCell>
                    <TableCell>
                      <span className={u.is_admin ? "soc-badge soc-badge-high" : "soc-badge soc-badge-info"}>
                        {u.is_admin ? "ADMINISTRATOR" : "ANALYST"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-mono ${u.is_active ? "text-emerald-400" : "text-red-400"}`}>
                        {u.is_active ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            ACTIVE
                          </>
                        ) : (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            SUSPENDED
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.is_active && !u.is_admin ? (
                        <button
                          onClick={() => handleBlockUser(u.id)}
                          className="text-xs font-semibold px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 rounded-lg cursor-pointer transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic font-mono">Protected</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
