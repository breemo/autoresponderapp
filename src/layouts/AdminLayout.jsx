import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const menuItems = [
    { path: "/admin", label: "الصفحة الرئيسية" },
    { path: "/admin/clients", label: "العملاء" },
    { path: "/admin/auto-replies", label: "الردود التلقائية" },
    { path: "/admin/messages", label: "الرسائل" },
    { path: "/admin/settings", label: "الإعدادات" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col border-r">
        <h1 className="text-xl font-bold text-blue-600 mb-6">
          AutoResponder Admin
        </h1>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded px-3 py-2 text-sm ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
