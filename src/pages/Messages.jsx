import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { supabase } from "../lib/supabaseClient";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, client_id, channel, direction, content, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">الرسائل</h2>
      <p className="text-gray-500 mb-6 text-sm">
        عرض آخر الرسائل الداخلة والخارجة من النظام (للمراجعة أو التتبع).
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">جارِ تحميل الرسائل...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-400 text-sm">لا توجد رسائل حتى الآن.</p>
      ) : (
        <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="py-2 px-2">العميل</th>
                <th className="py-2 px-2">القناة</th>
                <th className="py-2 px-2">الاتجاه</th>
                <th className="py-2 px-2">المحتوى</th>
                <th className="py-2 px-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{m.client_id || "-"}</td>
                  <td className="py-2 px-2">{m.channel || "-"}</td>
                  <td className="py-2 px-2">
                    {m.direction === "out" ? "صادر" : "وارد"}
                  </td>
                  <td className="py-2 px-2 max-w-xs truncate">{m.content}</td>
                  <td className="py-2 px-2 text-gray-500">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString("ar-EG")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
