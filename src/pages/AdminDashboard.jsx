import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    plansCount: 0,
    totalMessages: 0,
    totalAutoReplies: 0,
    recentClients: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      // العملاء
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id,business_name,email,role,is_active,created_at")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      const totalClients = clients?.length || 0;
      const activeClients =
        clients?.filter(
          (c) => c.is_active !== false && c.role !== "disabled"
        ).length || 0;
      const recentClients = clients?.slice(0, 5) || [];

      // عدد الباقات
      const { count: plansCount, error: plansError } = await supabase
        .from("plans")
        .select("*", { count: "exact", head: true });
      if (plansError) throw plansError;

      // عدد الرسائل
      const { count: totalMessages, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
      if (msgError) throw msgError;

      // عدد الردود التلقائية
      const { count: totalAutoReplies, error: autoError } =
        await supabase
          .from("auto_replies")
          .select("*", { count: "exact", head: true });
      if (autoError) throw autoError;

      setStats({
        totalClients,
        activeClients,
        plansCount: plansCount || 0,
        totalMessages: totalMessages || 0,
        totalAutoReplies: totalAutoReplies || 0,
        recentClients,
      });
    } catch (err) {
      console.error("خطأ في جلب الإحصائيات:", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        مرحباً {user?.name || "Admin User"} 👋
      </h1>
      <p className="text-gray-500 mb-8">
        لوحة تحكم AutoResponder لإدارة العملاء، الخطط، الرسائل والردود التلقائية.
      </p>

      {loading ? (
        <Loader message="جارِ تحميل الإحصائيات..." />
      ) : (
        <>
          {/* الكروت */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">إجمالي العملاء</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalClients}
              </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">العملاء المفعّلين</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeClients}
              </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">عدد الباقات</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.plansCount}
              </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">إجمالي الرسائل</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.totalMessages}
              </p>
            </div>
          </div>

          {/* آخر 5 عملاء */}
          <div className="bg-white shadow rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">آخر 5 عملاء</h2>
              <span className="text-sm text-gray-400">
                إجمالي الردود التلقائية:{" "}
                <span className="font-semibold text-blue-600">
                  {stats.totalAutoReplies}
                </span>
              </span>
            </div>

            {stats.recentClients.length === 0 ? (
              <p className="text-gray-400">لا يوجد عملاء بعد.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-gray-600">
                    <th className="py-2 text-right">الاسم التجاري</th>
                    <th className="py-2 text-right">الإيميل</th>
                    <th className="py-2 text-right">الحالة</th>
                    <th className="py-2 text-right">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentClients.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2">{c.business_name}</td>
                      <td className="py-2">{c.email}</td>
                      <td className="py-2">
                        {c.is_active === false || c.role === "disabled" ? (
                          <span className="text-red-500">معطّل</span>
                        ) : (
                          <span className="text-green-600">مفعّل</span>
                        )}
                      </td>
                      <td className="py-2 text-gray-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("ar-EG")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
