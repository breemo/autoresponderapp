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
    recentClients: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 🟦 جلب العملاء
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, business_name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      const totalClients = clients?.length || 0;
      const activeClients =
        clients?.filter((c) => c.role !== "disabled").length || 0;
      const recentClients = clients?.slice(0, 5) || [];

      // 🟩 جلب عدد الباقات
      const { count: plansCount, error: plansError } = await supabase
        .from("plans")
        .select("*", { count: "exact", head: true });

      if (plansError) throw plansError;

      // 🟨 تعبئة البيانات
      setStats({
        totalClients,
        activeClients,
        plansCount: plansCount ?? 0,
        recentClients,
      });
    } catch (err) {
      console.error("Error loading dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        مرحباً {user?.name || "أيها المدير"} 👋
      </h1>

      <p className="text-gray-500 mb-8">
        لوحة تحكم نظام AutoResponder لإدارة العملاء والباقات والإعدادات.
      </p>

      {/* 🟦 Cards */}
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

      {/* 🟩 Recent Clients */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">آخر 5 عملاء</h2>

        {stats.recentClients.length === 0 ? (
          <p className="text-gray-400">لا يوجد عملاء بعد.</p>
        ) : (
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-gray-600">
                <th className="py-2">الاسم التجاري</th>
                <th className="py-2">البريد الإلكتروني</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentClients.map((c) => (
                <tr key={c.id} className="border-b text-sm">
                  <td className="py-2">{c.business_name}</td>
                  <td className="py-2">{c.email}</td>
                  <td className="py-2">
                    {c.role === "disabled" ? (
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
    </div>
  );
}
