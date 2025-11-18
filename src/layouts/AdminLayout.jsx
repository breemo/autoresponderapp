// src/layouts/AdminLayout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import {
  HomeIcon,
  UsersIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  InboxStackIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"; // tailwind icons

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }

  // دالة تساعدنا نحدد الرابط المختار
  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="px-6 py-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-wide">
            AutoResponder
          </h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin"
            )}`}
          >
            <HomeIcon className="h-5" />
            <span>الصفحة الرئيسية</span>
          </Link>

          <Link
            to="/admin/clients"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin/clients"
            )}`}
          >
            <UsersIcon className="h-5" />
            <span>العملاء</span>
          </Link>

          <Link
            to="/admin/messages"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin/messages"
            )}`}
          >
            <InboxStackIcon className="h-5" />
            <span>الرسائل</span>
          </Link>

          <Link
            to="/admin/auto-replies"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin/auto-replies"
            )}`}
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-5" />
            <span>الردود التلقائية</span>
          </Link>

          <Link
            to="/admin/plans"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin/plans"
            )}`}
          >
            <Squares2X2Icon className="h-5" />
            <span>الباقات</span>
          </Link>

          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(
              "/admin/settings"
            )}`}
          >
            <Cog6ToothIcon className="h-5" />
            <span>الإعدادات</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full text-center py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b shadow flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-700">
            لوحة التحكم
          </h2>

          <div className="text-gray-500 text-sm">مرحباً بك 👋</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
