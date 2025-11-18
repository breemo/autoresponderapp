// src/App.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Clients from "./pages/Clients";
import Messages from "./pages/Messages";
import AutoReplies from "./pages/AutoReplies";
import Settings from "./pages/Settings";
import ClientDashboard from "./pages/ClientDashboard";
import AdminLayout from "./layouts/AdminLayout";
import Plans from "./pages/Plans";
import ClientUsers from "./pages/ClientUsers";

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// حماية صفحات الأدمن
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  const [user, setUser] = useState(null);

  // تحميل المستخدم من localStorage عند أول تحميل
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* صفحات الأدمن */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/clients"
            element={
              <AdminRoute>
                <Clients />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <AdminRoute>
                <Messages />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <Settings />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auto-replies"
            element={
              <AdminRoute>
                <AutoReplies />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/plans"
            element={
              <AdminRoute>
                <Plans />
              </AdminRoute>
            }
          />

          {/* صفحة المستخدمين الخاصة بكل عميل */}
          <Route
            path="/admin/client-users/:clientId"
            element={
              <AdminRoute>
                <ClientUsers />
              </AdminRoute>
            }
          />

          {/* صفحة العملاء */}
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

          {/* صفحة تسجيل الدخول */}
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
