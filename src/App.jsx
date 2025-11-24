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

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";
import Login from "./pages/Login.jsx";


import Clients from "./pages/Clients";
import Messages from "./pages/Messages";
import AutoReplies from "./pages/AutoReplies";
import Plans from "./pages/Plans";
import ClientUsers from "./pages/ClientUsers"; // حسب مسارك الحالي
import Settings from "./pages/Settings";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminClients from "./pages/admin/Clients.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import AdminPlans from "./pages/admin/Plans.jsx";
import AdminMessages from "./pages/admin/Messages.jsx";
import AdminAutoReplies from "./pages/admin/AutoReplies.jsx";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard.jsx";
import ClientMessages from "./pages/client/ClientMessages.jsx";
import ClientAutoReplies from "./pages/client/ClientAutoReplies.jsx";
import ClientSettings from "./pages/client/ClientSettings.jsx";


const router = createBrowserRouter([
  { path: "/", element: <Login /> },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "clients", element: <AdminClients /> },
      { path: "plans", element: <AdminPlans /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "auto-replies", element: <AdminAutoReplies /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },

  {
    path: "/client",
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientDashboard /> },
      { path: "messages", element: <ClientMessages /> },
      { path: "auto-replies", element: <ClientAutoReplies /> },
      { path: "settings", element: <ClientSettings /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}



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
  element={
    <ClientRoute>
      <ClientSettings />
    </ClientRoute>
  }
/>
          <Route path="/client/integrations" element={<ClientLayout><ClientIntegrations /></ClientLayout>} />

        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

