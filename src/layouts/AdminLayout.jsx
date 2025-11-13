import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-6">
          📊 AutoResponder Admin
        </h2>

        <ul className="space-y-3 text-gray-700">
          <li>
            <Link to="/admin" className="block hover:text-blue-600">
              🏠 الصفحة الرئيسية
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className="block hover:text-blue-600">
              👥 إدارة المستخدمين
            </Link>
          </li>
          <li>
            <Link to="/admin/messages" className="block hover:text-blue-600">
              💬 سجل الرسائل
            </Link>
          </li>
          <li>
            <Link to="/admin/replies" className="block hover:text-blue-600">
              🤖 الردود التلقائية
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className="block hover:text-blue-600">
              ⚙️ الإعدادات
            </Link>
          </li>
        </ul>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
