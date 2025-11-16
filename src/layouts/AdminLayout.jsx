import React from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  const menuItems = [
    { path: "/admin", label: "الصفحة الرئيسية" },
    { path: "/admin/clients", label: "العملاء" },
    { path: "/admin/messages", label: "الرسائل المرسلة" },
    { path: "/admin/auto-replies", label: "الردود التلقائية" },
    { path: "/admin/settings", label: "الإعدادات" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-4 border-b">
          <div className="text-sm text-gray-400">AutoResponder</div>
          <div className="font-bold text-blue-600 text-lg">Admin</div>
          <div className="text-xs text-gray-400 mt-1 truncate">
            {user?.email}
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-3 py-2 ${
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
          className="m-4 mt-auto bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
        >
          تسجيل الخروج
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
