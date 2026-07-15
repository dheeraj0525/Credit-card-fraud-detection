import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthService from "../services/auth.services";
import { Shield } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md">
        {/* Brand */}
        <div className="text-center flex flex-col items-center gap-2">
          <Shield className="h-10 w-10 text-blue-500" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">FraudSense</h2>
          <p className="text-xs text-slate-400">Advanced Credit Card Fraud Detection Gateway</p>
        </div>

        {error && <div className="text-xs text-red-450 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}
        {message && <div className="text-xs text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded">{message}</div>}

        {view === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="investigator@fraudsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-[10px] text-blue-400 hover:underline cursor-pointer bg-transparent border-0"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? "Authenticating..." : "Sign In Gateway"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Need investigator access?{" "}
              <button type="button" onClick={() => setView("register")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0">
                Register account
              </button>
            </p>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="new.investigator@fraudsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Create Password</label>
              <input
                type="password"
                placeholder="At least 8 chars, 1 upper, 1 special"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Verify password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? "Registering account..." : "Register Investigator"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Already have an account?{" "}
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0">
                Back to login
              </button>
            </p>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Account Email Address</label>
              <input
                type="email"
                placeholder="investigator@fraudsense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? "Generating token..." : "Send Reset Token"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Remembered your password?{" "}
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0">
                Back to login
              </button>
            </p>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Reset Access Token</label>
              <input
                type="text"
                placeholder="Paste token generated above"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Create New Password</label>
              <input
                type="password"
                placeholder="At least 8 chars, 1 upper, 1 special"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm tracking-wide disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? "Resetting password..." : "Confirm Reset Password"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              <button type="button" onClick={() => setView("login")} className="text-blue-400 hover:underline cursor-pointer bg-transparent border-0">
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