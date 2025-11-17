import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";

function NavItem({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  const base =
    "block px-4 py-2 rounded-lg text-sm mb-1 transition-colors";
  const activeClass = "bg-blue-50 text-blue-600 font-semibold";
  const normalClass = "text-gray-700 hover:bg-gray-50";

  return (
    <Link to={to} className={`${base} ${active ? activeClass : normalClass}`}>
      {children}
    </Link>
  );
}

export default function ClientLayout({ children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="px-6 py-4 border-b">
          <div className="text-sm text-gray-400">AutoResponder</div>
          <div className="text-lg font-semibold text-gray-900">
            Client
          </div>
          <div className="mt-2 text-xs text-gray-500 break-all">
            {user?.email}
          </div>
        </div>

        <nav className="flex-1 px-4 py-4">
          <NavItem to="/client">الصفحة الرئيسية</NavItem>
          <NavItem to="/client/messages">الرسائل</NavItem>
          <NavItem to="/client/auto-replies">الردود التلقائية</NavItem>
          <NavItem to="/client/settings">الإعدادات</NavItem>
        </nav>

        <div className="px-4 py-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg"
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
