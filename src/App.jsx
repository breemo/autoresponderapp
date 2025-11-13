import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

// ✅ أنشأنا الـ Context
const AuthContext = createContext(null);

// ✅ أضف هذا السطر لتصدير الـ hook
export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
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
