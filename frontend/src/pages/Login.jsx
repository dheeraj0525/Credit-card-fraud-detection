import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthService from "../services/auth.services";
import { Shield, Lock, Mail, Key, ArrowRight, ShieldCheck } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const [view, setView] = useState("login"); // "login", "register", "forgot", "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await AuthService.register(email, password);
      setMessage("Registration successful! You can now log in.");
      setView("login");
      setPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await AuthService.forgotPassword(email);
      setResetToken(data.reset_token);
      setMessage("Reset token generated! Copy it below to reset password.");
      setView("reset");
    } catch (e) {
      setError(e.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await AuthService.resetPassword(resetToken, password);
      setMessage("Password reset successfully! Log in with your new password.");
      setView("login");
      setEmail("");
      setPassword("");
      setResetToken("");
    } catch (e) {
      setError(e.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-sans relative overflow-hidden">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/90 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">FraudSense</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
              Security Operations Center Gateway
            </p>
          </div>
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-lg">{error}</div>}
        {message && <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg">{message}</div>}

        {view === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Investigator Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="investigator@fraudsense.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="soc-input font-mono"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Password Signature</label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-0 font-mono"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating session..." : "Sign In Gateway"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-xs text-slate-400 mt-3">
              Need investigator clearance?{" "}
              <button
                type="button"
                onClick={() => setView("register")}
                className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0 font-semibold"
              >
                Register account
              </button>
            </p>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Investigator Email</label>
              <input
                type="email"
                placeholder="new.investigator@fraudsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Create Password</label>
              <input
                type="password"
                placeholder="At least 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="Verify password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-blue-950/40"
            >
              {loading ? "Registering account..." : "Register Investigator"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Already registered?{" "}
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0 font-semibold">
                Back to login
              </button>
            </p>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Account Email Address</label>
              <input
                type="email"
                placeholder="investigator@fraudsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-blue-950/40"
            >
              {loading ? "Generating token..." : "Send Reset Token"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0 font-semibold">
                Back to login
              </button>
            </p>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Reset Access Token</label>
              <input
                type="text"
                placeholder="Paste token generated above"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="soc-input font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Create New Password</label>
              <input
                type="password"
                placeholder="At least 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="soc-input font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-blue-950/40"
            >
              {loading ? "Resetting password..." : "Confirm Reset Password"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0 font-semibold">
                Back to login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;