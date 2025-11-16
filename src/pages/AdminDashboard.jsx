import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { supabase } from "../lib/supabaseClient";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    plansCount: 0,
    recentClients: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      // جلب العملاء
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, business_name, email, is_active, created_at")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      const totalClients = clients?.length || 0;

      // لو is_active غير موجود، نعتبر الكل مفعّل
      const activeClients =
        clients?.filter((c) => c.is_active !== false).length || 0;

      const recentClients = clients?.slice(0, 5) || [];

      // عدد الباقات
      const { count: plansCount, error: plansError } = await supabase
        .from("plans")
        .select("*", { count: "exact", head: true });

      if (plansError) throw plansError;

      setStats({
        totalClients,
        activeClients,
        plansCount: plansCount || 0,
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
        لوحة تحكم نظام AutoResponder لإدارة العملاء وخططهم وإعداداتهم.
      </p>

      {loading ? (
        <div className="text-gray-600">جارِ تحميل البيانات...</div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
          </div>

          {/* آخر 5 عملاء */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">آخر 5 عملاء</h2>
            {stats.recentClients.length === 0 ? (
              <p className="text-gray-400">لا يوجد عملاء بعد.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-2">الاسم التجاري</th>
                    <th className="py-2 px-2">الإيميل</th>
                    <th className="py-2 px-2">الحالة</th>
                    <th className="py-2 px-2">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentClients.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 px-2">{c.business_name}</td>
                      <td className="py-2 px-2">{c.email}</td>
                      <td className="py-2 px-2">
                        {c.is_active === false ? (
                          <span className="text-red-500">معطّل</span>
                        ) : (
                          <span className="text-green-600">مفعّل</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-gray-500">
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
