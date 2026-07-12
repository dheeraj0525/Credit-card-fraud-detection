import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import Transaction from "../pages/Transaction";
import Watchlist from "../pages/Watchlist";
import Profile from "../pages/Profile";
import FlaggedQueue from "../pages/FlaggedQueue";

import MainLayout from "../components/layout/MainLayout";

function AppRoutes() {
  return (
    <Routes>

      {/* Login page without layout */}
      <Route path="/" element={<Login />} />

      {/* All authenticated pages */}
      <Route element={<MainLayout />}>

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/transactions" element={<Transaction />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/watchlist" element={<Watchlist />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/flagged" element={<FlaggedQueue />} />

      </Route>

    </Routes>
  );
}

export default AppRoutes;