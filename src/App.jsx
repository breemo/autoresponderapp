import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

// صفحات الأدمن الجديدة
import AdminClients from "./pages/AdminClients";
import AdminMessages from "./pages/AdminMessages";
import AdminAutoReplies from "./pages/AdminAutoReplies";
import AdminSettings from "./pages/AdminSettings";

// ------------------------------------------------------
// 🔵 AUTH CONTEXT
// ------------------------------------------------------

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ------------------------------------------------------
// 🔵 APP COMPONENT
// ------------------------------------------------------

export default function App() {
  const [user, setUser] = useState(null);

  // تحميل المستخدم من localStorage عند بدء التشغيل
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/" element={<Login />} />

          {/* -------------------------
              🔵 ADMIN ROUTES
          -------------------------- */}
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin/clients"
            element={
              user?.role === "admin" ? (
                <AdminClients />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin/messages"
            element={
              user?.role === "admin" ? (
                <AdminMessages />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin/auto-replies"
            element{
              user?.role === "admin" ? (
                <AdminAutoReplies />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/admin/settings"
            element={
              user?.role === "admin" ? (
                <AdminSettings />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* -------------------------
              🟢 CLIENT ROUTE
          -------------------------- */}
          <Route
            path="/client"
            element={
              user?.role === "client" ? (
                <ClientDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
