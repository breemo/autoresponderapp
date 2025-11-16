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

// الصفحات
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Clients from "./pages/Clients";
import Messages from "./pages/Messages";
import AutoReplies from "./pages/AutoReplies";
import Settings from "./pages/Settings";
import ClientDashboard from "./pages/ClientDashboard";

// الـ Layout
import AdminLayout from "./layouts/AdminLayout";

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// ---------- حماية صفحات الأدمن + وضع الـ Layout ----------
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  const [user, setUser] = useState(null);

  // تحميل المستخدم عند أول تشغيل
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* صفحة تسجيل الدخول */}
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

          {/* صفحة العميل */}
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

          {/* أي رابط غلط */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
