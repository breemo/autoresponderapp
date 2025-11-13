import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "../components/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    messages: 0,
    autoReplies: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });

      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      const { count: autoRepliesCount } = await supabase
        .from("auto_replies")
        .select("*", { count: "exact", head: true });

      setStats({
        clients: clientsCount || 0,
        messages: messagesCount || 0,
        autoReplies: autoRepliesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">
        مرحباً Admin User 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">عدد العملاء</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.clients}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">عدد الرسائل المرسلة</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.messages}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">عدد الردود التلقائية</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.autoReplies}
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}
