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
import ClientMessages from "./pages/ClientMessages";
import ClientAutoReplies from "./pages/ClientAutoReplies";
import ClientSettings from "./pages/ClientSettings";

import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Route خاصة بالأدمن
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Route خاصة بالعميل
function ClientRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== "client") {
    return <Navigate to="/" replace />;
  }

  return <ClientLayout>{children}</ClientLayout>;
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
          {/* Login */}
          <Route path="/" element={<Login />} />

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

          {/* صفحات العميل */}
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
                <ClientMessages />
              </ClientRoute>
            }
          />
          <Route
            path="/client/auto-replies"
            element={
              <ClientRoute>
                <ClientAutoReplies />
              </ClientRoute>
            }
          />
          <Route
            path="/client/settings"
            element{
              <ClientRoute>
                <ClientSettings />
              </ClientRoute>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
