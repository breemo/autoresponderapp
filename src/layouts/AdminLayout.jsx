// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
      : "text-gray-700 hover:bg-gray-100";

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar - Hexnode Style */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900">
            AutoResponder
          </h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4">
          <ul className="flex flex-col">

            <li>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin"
                )}`}
              >
                🏠 <span>الصفحة الرئيسية</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/clients"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin/clients"
                )}`}
              >
                👥 <span>العملاء</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/messages"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin/messages"
                )}`}
              >
                💬 <span>الرسائل</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/auto-replies"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin/auto-replies"
                )}`}
              >
                🔁 <span>الردود التلقائية</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/plans"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin/plans"
                )}`}
              >
                📦 <span>الباقات</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${isActive(
                  "/admin/settings"
                )}`}
              >
                ⚙️ <span>الإعدادات</span>
              </Link>
            </li>

          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full text-center py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-700">لوحة التحكم</h2>
          <div className="text-gray-500 text-sm">👋 مرحباً بك</div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

    </div>
  );
}
