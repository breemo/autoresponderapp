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

import AdminClients from "./pages/AdminClients";
import AdminPlans from "./pages/AdminPlans";
import AdminClientSettings from "./pages/AdminClientSettings";
import Settings from "./pages/Settings";

// ✅ Auth Context
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [user, setUser] = useState(null);

  // تحميل المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Invalid user JSON");
      }
    }
  }, []);

  const requireAdmin = (element) =>
    user?.role === "admin" ? element : <Navigate to="/" replace />;

  const requireClient = (element) =>
    user?.role === "client" ? element : <Navigate to="/" replace />;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin area */}
          <Route
            path="/admin"
            element={requireAdmin(<AdminDashboard />)}
          />
          <Route
            path="/admin/clients"
            element={requireAdmin(<AdminClients />)}
          />
          <Route
            path="/admin/plans"
            element={requireAdmin(<AdminPlans />)}
          />
          <Route
            path="/admin/client/:id"
            element={requireAdmin(<AdminClientSettings />)}
          />
          <Route
            path="/admin/settings"
            element={requireAdmin(<Settings />)}
          />

          {/* Client dashboard */}
          <Route
            path="/client"
            element={requireClient(<ClientDashboard />)}
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
