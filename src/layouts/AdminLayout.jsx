import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const menu = [
    { name: "الصفحة الرئيسية", path: "/admin" },
    { name: "العملاء", path: "/admin/clients" },
    { name: "الرسائل المرسلة", path: "/admin/messages" },
    { name: "الردود التلقائية", path: "/admin/auto-replies" },
    { name: "الإعدادات", path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-5 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          AutoResponder Admin
        </h2>

        <nav className="flex-1 space-y-3">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg font-medium ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-5 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
