// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow h-screen p-6 flex flex-col">
        <h1 className="text-xl font-bold text-blue-600 mb-6">
          AutoResponder Admin
        </h1>

        <nav className="flex flex-col gap-4">
          <Link to="/admin" className="hover:text-blue-600">
            الصفحة الرئيسية
          </Link>
          <Link to="/admin/clients" className="hover:text-blue-600">
            العملاء
          </Link>
          <Link to="/admin/messages" className="hover:text-blue-600">
            الرسائل
          </Link>
          <Link to="/admin/auto-replies" className="hover:text-blue-600">
            الردود التلقائية
          </Link>
          {/* ✅ رابط الباقات فوق الإعدادات */}
          <Link to="/admin/plans" className="hover:text-blue-600">
            الباقات
          </Link>
          <Link to="/admin/settings" className="hover:text-blue-600">
            الإعدادات
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-500 text-white py-2 rounded"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
