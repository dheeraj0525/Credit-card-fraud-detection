import React, { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Users, ShieldAlert, UserCheck, UserX, AlertCircle } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Investigator Accounts Control</h1>
        <p className="text-sm text-slate-400">View active analyst sessions, update roles privileges, and block/unblock investigator access keys.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
        <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Investigator Accounts Directory
        </h3>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading investigator accounts...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-650" />
            <span>No investigator accounts registered in system.</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Role Level</TableHead>
                <TableHead>Access Status</TableHead>
                <TableHead className="text-right">Actions Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-semibold text-slate-200">ID-{u.id * 1000 + 49}</TableCell>
                  <TableCell className="font-mono text-slate-200">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.is_admin ? "danger" : "info"}>
                      {u.is_admin ? "ADMINISTRATOR" : "ANALYST"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? "text-emerald-400" : "text-red-500"}`}>
                      {u.is_active ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          ACTIVE
                        </>
                      ) : (
                        <>
                          <UserX className="h-4 w-4" />
                          SUSPENDED
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.is_active && !u.is_admin ? (
                      <button
                        onClick={() => handleBlockUser(u.id)}
                        className="text-xs font-semibold px-2.5 py-1 bg-red-950/40 text-red-400 border border-red-550/20 hover:bg-red-950/60 rounded cursor-pointer transition-colors"
                      >
                        Block Access
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 italic">No actions available</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
