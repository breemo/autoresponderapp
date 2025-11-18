// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";

  // SVG ICON COMPONENT
  const Icon = ({ path }) => (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="px-6 py-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-wide">AutoResponder</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">

          <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin")}`}>
            <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            الصفحة الرئيسية
          </Link>

          <Link to="/admin/clients" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/clients")}`}>
            <Icon path="M17 20h5V10a2 2 0 00-2-2h-3m-4 12h-4a2 2 0 01-2-2V8m6 12v-8m0 0H7m6 0h6M7 12H2v8a2 2 0 002 2h3" />
            العملاء
          </Link>

          <Link to="/admin/messages" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/messages")}`}>
            <Icon path="M7 8h10M7 12h6m-6 4h10M5 4h14a2 2 0 012 2v14l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
            الرسائل
          </Link>

          <Link to="/admin/auto-replies" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/auto-replies")}`}>
            <Icon path="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-3-6.708" />
            الردود التلقائية
          </Link>

          <Link to="/admin/plans" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/plans")}`}>
            <Icon path="M4 6h16M4 12h16M4 18h7" />
            الباقات
          </Link>

          <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive("/admin/settings")}`}>
            <Icon path="M12 15a3 3 0 100-6 3 3 0 000 6zm8.485-3a6.968 6.968 0 01-.533 2.63l2.122 1.65-2 3.464-2.122-1.227a6.968 6.968 0 01-2.63.533L14 23h-4l-.322-2.95a6.968 6.968 0 01-2.63-.533L4.926 22l-2-3.464 2.122-1.65A6.968 6.968 0 014.485 12a6.968 6.968 0 01.533-2.63L2.896 7.72l2-3.464L7.018 5.48a6.968 6.968 0 012.63-.533L10 2h4l.352 2.947a6.968 6.968 0 012.63.533L19.074 4l2 3.464-2.122 1.65A6.968 6.968 0 0120.485 12z" />
            الإعدادات
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full text-center py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b shadow flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-700">لوحة التحكم</h2>
          <div className="text-gray-500 text-sm">مرحباً بك 👋</div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
