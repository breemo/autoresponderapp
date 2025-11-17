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

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Route خاص بالأدمن + يحط الـ Layout مرة واحدة بس
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setBootLoading(false);
  }, []);

  if (bootLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">جارِ التحميل...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* تسجيل الدخول */}
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

          {/* صفحة العميل (لو حاب تستخدمها لاحقًا) */}
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
