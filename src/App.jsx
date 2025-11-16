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
import AdminLayout from "./layouts/AdminLayout";
import Clients from "./pages/Clients";
import Messages from "./pages/Messages";
import AutoReplies from "./pages/AutoReplies";
import Settings from "./pages/Settings";

// Context للمستخدم الحالي
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  // نقرأ المستخدم من localStorage عند أول تحميل
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error reading user from localStorage", err);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  if (bootstrapping) return null; // ممكن تحط Splash لو حاب

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* صفحة الدخول */}
          <Route path="/" element={<Login />} />

          {/* Dashboard للعميل العادي */}
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

          {/* منطقة الأدمن مع Layout و Nested Routes */}
          <Route
            path="/admin/*"
            element={
              user?.role === "admin" ? (
                <AdminLayout />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="messages" element={<Messages />} />
            <Route path="auto-replies" element={<AutoReplies />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* أي مسار غريب -> Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
