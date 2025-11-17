import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";

export default function ClientLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const menuItems = [
    { to: "/client", label: "الصفحة الرئيسية" },
    { to: "/client/messages", label: "الرسائل" },
    { to: "/client/auto-replies", label: "الردود التلقائية" },
    { to: "/client/settings", label: "الإعدادات" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow h-screen p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-blue-600">AutoResponder</h1>
          <p className="text-sm text-gray-500">Client</p>
          {user?.email && (
            <p className="mt-2 text-xs text-gray-400 truncate">{user.email}</p>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded text-sm text-right ${
                  active
                    ? "bg-blue-600 text-white"
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
          className="mt-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* محتوى الصفحة */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
