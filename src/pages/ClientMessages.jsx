import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../App";

export default function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("messages")
        .select("id, text, direction, status, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error("خطأ في جلب الرسائل:", err.message);
      setError("حدث خطأ أثناء جلب الرسائل.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = messages.filter((m) =>
    m.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الرسائل</h1>
      <p className="text-gray-500 mb-6">
        يمكنك استعراض الرسائل التي تم استقبالها أو إرسالها من خلال النظام.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="بحث في نص الرسالة..."
          className="border rounded px-3 py-2 text-sm w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-500">جارِ تحميل الرسائل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">لا توجد رسائل بعد.</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-gray-600">
                <th className="py-2 px-3 text-right">نص الرسالة</th>
                <th className="py-2 px-3 text-right">الاتجاه</th>
                <th className="py-2 px-3 text-right">الحالة</th>
                <th className="py-2 px-3 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 max-w-xs truncate">{m.text}</td>
                  <td className="py-2 px-3">
                    {m.direction === "in" || m.direction === "incoming"
                      ? "وارد"
                      : m.direction === "out" || m.direction === "outgoing"
                      ? "صادر"
                      : m.direction || "-"}
                  </td>
                  <td className="py-2 px-3">
                    {m.status || "-"}
                  </td>
                  <td className="py-2 px-3 text-gray-500">
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
    </div>
  );
}
