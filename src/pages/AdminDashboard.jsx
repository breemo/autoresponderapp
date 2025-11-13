import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

export default function AdminDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🔹 الشريط العلوي */}
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">
          📢 AutoResponder Admin
        </h1>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          تسجيل الخروج
        </button>
      </nav>

      {/* 🔹 المحتوى */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          مرحبًا {user?.name || "أيها المدير"} 👋
        </h2>

        {/* بطاقات المعلومات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-xl p-6 text-center border border-gray-100">
            <h3 className="text-gray-500">عدد العملاء</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">32</p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center border border-gray-100">
            <h3 className="text-gray-500">عدد الرسائل المرسلة</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">128</p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center border border-gray-100">
            <h3 className="text-gray-500">عدد الردود التلقائية</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">87</p>
          </div>
        </div>

        {/* زر تنفيذ إجراء */}
        <div className="text-center">
          <button
            onClick={() => alert("سيتم تنفيذ الإشعار لاحقًا 🔔")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            إرسال إشعار عام
          </button>
        </div>
      </main>
    </div>
  );
}
