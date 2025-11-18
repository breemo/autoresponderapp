// src/layouts/ClientLayout.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const menuItems = [
  { to: "/client", label: "الصفحة الرئيسية", key: "dashboard" },
  { to: "/client/messages", label: "الرسائل", key: "messages" },
  { to: "/client/auto-replies", label: "الردود التلقائية", key: "auto-replies" },
  { to: "/client/settings", label: "الإعدادات", key: "settings" },
];

export default function ClientLayout({ children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        {/* Logo + user */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="text-xs text-gray-400 mb-1">AutoResponder</div>
          <div className="font-bold text-lg text-gray-800">
            Client
          </div>

          {user && (
            <div className="mt-4 text-xs text-gray-500">
              <div className="font-semibold text-gray-700 truncate">
                {user.name || "عميل"}
              </div>
              <div className="truncate">{user.email}</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/client"}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium
                 transition-colors cursor-pointer
                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-sm"
                     : "text-gray-700 hover:bg-gray-100"
                 }`
              }
            >
              <span>{item.label}</span>
              {/* نقطة صغيرة كـ indicator */}
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="font-semibold text-gray-800 text-sm">
            لوحة تحكم العميل
          </div>
          {/* مساحة مستقبلية لـ search / filters / plan badge */}
          {/* نضيفها لاحقاً: خطة العميل، عداد الرسائل، ... */}
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
