import React from "react";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../App";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">مرحباً {user?.name} 👋</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow p-6 rounded-lg text-center">
          <p className="text-gray-500">عدد العملاء</p>
          <h2 className="text-3xl font-bold text-blue-600">32</h2>
        </div>

        <div className="bg-white shadow p-6 rounded-lg text-center">
          <p className="text-gray-500">عدد الرسائل المرسلة</p>
          <h2 className="text-3xl font-bold text-blue-600">128</h2>
        </div>

        <div className="bg-white shadow p-6 rounded-lg text-center">
          <p className="text-gray-500">عدد الردود التلقائية</p>
          <h2 className="text-3xl font-bold text-blue-600">87</h2>
        </div>
      </div>
    </AdminLayout>
  );
}
