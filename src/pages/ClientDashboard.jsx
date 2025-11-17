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
    if (!user?.id) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchStats() {
    try {
      setLoading(true);
      setError("");

      const clientId = user.id;

      // إجمالي الرسائل
      const { count: totalMessages, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId);

      if (msgError) throw msgError;

      // عدد الردود التلقائية
      const { count: autoRepliesCount, error: arError } = await supabase
        .from("auto_replies")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId);

      if (arError) throw arError;

      // بيانات الخطة
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
        totalMessages: totalMessages || 0,
        autoRepliesCount: autoRepliesCount || 0,
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
    <div>
      <h1 className="text-3xl font-bold mb-2">
        مرحباً {displayName} 👋
      </h1>
      <p className="text-gray-500 mb-8">
        لوحة تحكم AutoResponder لمتابعة رسائلك والردود التلقائية وخطتك الحالية.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">جارِ تحميل البيانات...</p>
      ) : (
        <>
          {/* البطاقات العلوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">إجمالي الرسائل</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalMessages}
              </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">عدد الردود التلقائية</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.autoRepliesCount}
              </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-2">الخطة الحالية</p>
              <p className="text-lg font-semibold text-purple-600">
                {stats.planName || "غير محددة"}
              </p>
              {stats.maxMessages !== null && (
                <p className="mt-1 text-xs text-gray-400">
                  الحد الأقصى للرسائل: {stats.maxMessages}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
