import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `w-full text-right px-3 py-2 rounded-md text-sm ${
      isActive
        ? "bg-blue-100 text-blue-700 font-semibold"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-blue-600 leading-tight">
            AutoResponder
            <br />
            <span className="text-sm text-gray-500">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <NavLink to="/admin" end className={linkClass}>
            الصفحة الرئيسية
          </NavLink>
          <NavLink to="/admin/clients" className={linkClass}>
            العملاء
          </NavLink>
          <NavLink to="/admin/messages" className={linkClass}>
            الرسائل المرسلة
          </NavLink>
          <NavLink to="/admin/auto-replies" className={linkClass}>
            الردود التلقائية
          </NavLink>
          <NavLink to="/admin/settings" className={linkClass}>
            الإعدادات
          </NavLink>
        </nav>

        <div className="px-4 pb-4 pt-2 border-t">
          <p className="text-xs text-gray-400 mb-2 truncate">
            {user?.email}
          </p>
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-md"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* محتوى الصفحات */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
