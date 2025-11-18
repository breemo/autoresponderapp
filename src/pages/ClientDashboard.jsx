import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../App";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMessages: 0,
    autoRepliesCount: 0,
    planName: "",
    maxMessages: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");

      const clientId = user.id;

      // --- إجمالي الرسائل ---
      const { count: totalMessages, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId);

      if (msgError) throw msgError;

      // --- عدد الردود التلقائية ---
      const { count: autoRepliesCount, error: arError } = await supabase
        .from("auto_replies")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId);

      if (arError) throw arError;

      // --- بيانات الباقة ---
      let planName = "";
      let maxMessages = null;

      if (user.plan_id) {
        const { data: plan, error: planError } = await supabase
          .from("plans")
          .select("name, max_messages")
          .eq("id", user.plan_id)
          .single();

        if (planError && planError.code !== "PGRST116") throw planError;

        if (plan) {
          planName = plan.name || "";
          maxMessages = plan.max_messages ?? null;
        }
      }

      setStats({
        totalMessages,
        autoRepliesCount,
        planName,
        maxMessages,
      });

    } catch (err) {
      console.error("خطأ في جلب بيانات العميل:", err.message);
      setError("حدث خطأ أثناء جلب بيانات لوحة التحكم.");
    } finally {
      setLoading(false);
    }
  }

  const displayName = user?.business_name || user?.name || "عميلنا الكريم";

  return (
    <div className="p-8">

      {/* ====== HEADER ====== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          مرحباً {displayName} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          تابع نشاط حسابك، الرسائل، الردود التلقائية والباقات.
        </p>
      </div>

      {/* ====== ERROR MESSAGE ====== */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ====== LOADING ====== */}
      {loading ? (
        <p className="text-gray-500">جارِ تحميل البيانات...</p>
      ) : (
        <>
          {/* ====== STATS CARDS ====== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <div className="bg-white border shadow-sm rounded-xl p-6 hover:shadow-md transition text-center">
              <p className="text-gray-500 text-sm">إجمالي الرسائل</p>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                {stats.totalMessages}
              </p>
            </div>

            <div className="bg-white border shadow-sm rounded-xl p-6 hover:shadow-md transition text-center">
              <p className="text-gray-500 text-sm">عدد الردود التلقائية</p>
              <p className="text-4xl font-extrabold text-green-600 mt-2">
                {stats.autoRepliesCount}
              </p>
            </div>

            <div className="bg-white border shadow-sm rounded-xl p-6 hover:shadow-md transition text-center">
              <p className="text-gray-500 text-sm">الخطة الحالية</p>

              <p className="text-2xl font-bold text-purple-600 mt-2">
                {stats.planName || "غير محددة"}
              </p>

              {stats.maxMessages !== null && (
                <p className="mt-1 text-xs text-gray-400">
                  الحد الأقصى للرسائل: {stats.maxMessages}
                </p>
              )}
            </div>

          </div>

          {/* ====== PLACEHOLDER GRAPH / LATER ====== */}
          <div className="bg-white border shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">إحصائيات الرسائل</h3>
            <div className="h-56 flex items-center justify-center text-gray-400">
              سيتم إضافة الرسم البياني هنا 📊
            </div>
          </div>
        </>
      )}
    </div>
  );
}
