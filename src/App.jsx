// src/App.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
import ClientUsers from "./pages/client/ClientUsers"; // حسب مسارك الحالي
import ClientLayout from "./layouts/ClientLayout";   // ✅ الجديد

// ---------- Auth Context ----------
const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

// ---------- Routes Helpers ----------
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

function ClientRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "client") {
    return <Navigate to="/" replace />;
  }
  return <ClientLayout>{children}</ClientLayout>;
}

export default function App() {
  const [user, setUser] = useState(null);

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
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin */}
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
            path="/admin/auto-replies"
            element={
              <AdminRoute>
                <AutoReplies />
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
            path="/admin/plans"
            element={
              <AdminRoute>
                <Plans />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/client-users/:clientId"
            element={
              <AdminRoute>
                <ClientUsers />
              </AdminRoute>
            }
          />

          {/* Client */}
          <Route
            path="/client"
            element={
              <ClientRoute>
                <ClientDashboard />
              </ClientRoute>
            }
          />
          <Route
            path="/client/messages"
            element={
              <ClientRoute>
                {/* لو عندك صفحة ClientMessages.jsx استبدلها هنا */}
                <div>صفحة رسائل العميل (بنشبّكها لاحقاً)</div>
              </ClientRoute>
            }
          />
          <Route
            path="/client/auto-replies"
            element={
              <ClientRoute>
                {/* ClientAutoReplies */}
                <div>صفحة الردود التلقائية للعميل</div>
              </ClientRoute>
            }
          />
          <Route
            path="/client/settings"
            element={
              <ClientRoute>
                {/* ClientSettings */}
                <div>إعدادات العميل</div>
              </ClientRoute>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
