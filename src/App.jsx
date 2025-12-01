// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AdminClientSettings from "./pages/admin/AdminClientSettings.jsx";
import AdminFeatures from "./pages/admin/AdminFeatures.jsx";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard.jsx";
import ClientMessages from "./pages/client/ClientMessages.jsx";
import ClientAutoReplies from "./pages/client/ClientAutoReplies.jsx";
import ClientSettings from "./pages/client/ClientSettings.jsx";
import ClientIntegrations from "./pages/client/ClientIntegrations.jsx";

// ----------- Route Guards -------------
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function ClientRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "client") return <Navigate to="/" replace />;
  return <ClientLayout>{children}</ClientLayout>;
}

// ----------- Main App -------------
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
          <Route
            path="/admin/clients"
            element={<AdminRoute><AdminClients /></AdminRoute>}
          />
          <Route
            path="/admin/features"
            element={<AdminRoute><AdminFeatures /></AdminRoute>}
          />
          <Route
            path="/admin/messages"
            element={<AdminRoute><AdminMessages /></AdminRoute>}
          />
          <Route
            path="/admin/auto-replies"
            element={<AdminRoute><AdminAutoReplies /></AdminRoute>}
          />
          <Route
            path="/admin/plans"
            element={<AdminRoute><AdminPlans /></AdminRoute>}
          />
          <Route
            path="/admin/settings"
            element={<AdminRoute><AdminSettings /></AdminRoute>}
          />
          <Route
            path="/admin/client/:id"
            element={<AdminRoute><AdminClientSettings /></AdminRoute>}
          />

          {/* Client */}
          <Route
            path="/client"
            element={<ClientRoute><ClientDashboard /></ClientRoute>}
          />
          <Route
            path="/client/messages"
            element={<ClientRoute><ClientMessages /></ClientRoute>}
          />
          <Route
            path="/client/auto-replies"
            element={<ClientRoute><ClientAutoReplies /></ClientRoute>}
          />
          <Route
            path="/client/settings"
            element={<ClientRoute><ClientSettings /></ClientRoute>}
          />
          <Route
            path="/client/integrations"
            element={<ClientRoute><ClientIntegrations /></ClientRoute>}
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
