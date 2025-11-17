import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const linkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-lg text-sm ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-50"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-5 border-b">
          <div className="text-xs text-gray-400">AutoResponder</div>
          <div className="font-bold text-lg text-blue-600">Admin</div>
          {user && (
            <div className="text-xs text-gray-500 mt-1 truncate">
              {user.email}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/admin" className={linkClasses} end>
            الصفحة الرئيسية
          </NavLink>
          <NavLink to="/admin/clients" className={linkClasses}>
            العملاء
          </NavLink>
          <NavLink to="/admin/messages" className={linkClasses}>
            الرسائل
          </NavLink>
          <NavLink to="/admin/auto-replies" className={linkClasses}>
            الردود التلقائية
          </NavLink>
          <NavLink to="/admin/settings" className={linkClasses}>
            الإعدادات
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
