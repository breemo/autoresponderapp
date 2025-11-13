import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ مرحلة التحقق الأولي

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // بعد قراءة اليوزر، حتى لو ما في يوزر
  }, []);

  // ✅ لو التطبيق لسه بيفحص اليوزر
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        جاري التحميل...
      </div>
    );
  }

  return (
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
  );
}
