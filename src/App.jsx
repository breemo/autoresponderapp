// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";

// Login
import Login from "./pages/Login.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminClients from "./pages/admin/AdminClients.jsx";
import AdminPlans from "./pages/admin/AdminPlans.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx";
import AdminAutoReplies from "./pages/admin/AdminAutoReplies.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard.jsx";
import ClientMessages from "./pages/client/ClientMessages.jsx";
import ClientAutoReplies from "./pages/client/ClientAutoReplies.jsx";
import ClientSettings from "./pages/client/ClientSettings.jsx";
import ClientIntegrations from "./pages/client/ClientIntegrations.jsx";

// ------------------ Route Guards ------------------
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function ClientRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "client") return <Navigate to="/" replace />;
  return children;
}

// ------------------ MAIN APP ------------------
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin ROUTES wrapped inside layout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="auto-replies" element={<AdminAutoReplies />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Client ROUTES wrapped inside layout */}
          <Route
            path="/client"
            element={
              <ClientRoute>
                <ClientLayout />
              </ClientRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="auto-replies" element={<ClientAutoReplies />} />
            <Route path="settings" element={<ClientSettings />} />
            <Route path="integrations" element={<ClientIntegrations />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}
