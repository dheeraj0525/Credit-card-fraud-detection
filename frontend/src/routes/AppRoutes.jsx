import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import Transactions from "../pages/Transactions";
import Watchlist from "../pages/Watchlist";
import Profile from "../pages/Profile";
import FlaggedQueue from "../pages/FlaggedQueue";

import UserManagement from "../pages/admin/UserManagement";
import SystemHealth from "../pages/admin/SystemHealth";
import ModelManagement from "../pages/admin/ModelManagement";

import MainLayout from "../components/layout/MAinlayout";

function PrivateRoute({ children, analystRequired = false, adminRequired = false }) {
  const { token, isAnalyst, isAdmin } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (analystRequired && !isAnalyst()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (adminRequired && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />

        {/* Analyst clear required */}
        <Route
          path="/transactions"
          element={
            <PrivateRoute analystRequired>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute analystRequired>
              <Watchlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/flagged"
          element={
            <PrivateRoute analystRequired>
              <FlaggedQueue />
            </PrivateRoute>
          }
        />

        {/* Administrative permissions required */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute adminRequired>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/health"
          element={
            <PrivateRoute adminRequired>
              <SystemHealth />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/model"
          element={
            <PrivateRoute adminRequired>
              <ModelManagement />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default AppRoutes;