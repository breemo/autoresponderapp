import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientDashboard() {
  const { user } = useAuth();

  // نحدد client_id بشكل صحيح (من جدول clients وليس users)
  const clientId = user?.client_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalMessages: 0,
    incoming: 0,
    outgoing: 0,
    activeAutoReplies: 0,
    lastMessages: [],
  });

  useEffect(() => {
    if (!clientId) return;

    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        // 1) قراءة الرسائل
        const { data: messages, error: msgError } = await supabase
          .from("messages")
          .select("id, message, channel, sender, is_read, created_at")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false });

        if (msgError) throw msgError;

        const totalMessages = messages?.length || 0;
        const incoming = messages?.filter((m) => m.channel === "in").length || 0;
        const outgoing = messages?.filter((m) => m.channel === "out").length || 0;

        // آخر 5 رسائل
        const lastMessages = (messages || []).slice(0, 5);

        // 2) قراءة الردود التلقائية
        const { data: replies, error: replError } = await supabase
          .from("auto_replies")
          .select("id, is_active")
          .eq("client_id", clientId);

        if (replError) throw replError;

        const activeAutoReplies =
          replies?.filter((r) => r.is_active).length || 0;

        setStats({
          totalMessages,
          incoming,
          outgoing,
          activeAutoReplies,
          lastMessages,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [clientId]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        مرحباً {user?.business_name || "عميلنا"} 👋
      </h1>
      <p className="text-gray-500 mb-6">
        هذه لوحة التحكم الخاصة بك لمتابعة الرسائل والردود التلقائية.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* الكروت */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">إجمالي الرسائل</p>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? "..." : stats.totalMessages}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">الرسائل الواردة</p>
          <p className="text-3xl font-bold text-green-600">
            {loading ? "..." : stats.incoming}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">الرسائل الصادرة</p>
          <p className="text-3xl font-bold text-purple-600">
            {loading ? "..." : stats.outgoing}
          </p>
        </div>

        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">الردود التلقائية المفعّلة</p>
          <p className="text-3xl font-bold text-emerald-600">
            {loading ? "..." : stats.activeAutoReplies}
          </p>
        </div>
      </div>

      {/* آخر الرسائل */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">آخر الرسائل</h2>

        {stats.lastMessages.length === 0 ? (
          <p className="text-gray-400 text-sm">لا توجد رسائل بعد.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2 text-right">النص</th>
                <th className="py-2 text-right">الاتجاه</th>
                <th className="py-2 text-right">من</th>
                <th className="py-2 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {stats.lastMessages.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="py-2 max-w-xs truncate">{m.message}</td>
                  <td className="py-2">
                    {m.channel === "in" ? "واردة" : "صادرة"}
                  </td>
                  <td className="py-2 text-gray-700">{m.sender || "-"}</td>
                  <td className="py-2 text-gray-500">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString("ar-EG")
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
