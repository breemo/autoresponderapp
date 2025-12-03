import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientMessages() {
  const { user } = useAuth();
  const clientId = user?.client_id || user?.id;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  // فلاتر
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all"); // WhatsApp / Telegram / all
  const [direction, setDirection] = useState("all"); // in / out / all
  const [readState, setReadState] = useState("all"); // read / unread / all

  async function fetchMessages() {
    try {
      setLoading(true);
      setError("");

      let query = supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      // فلتر الاتجاه
      if (direction !== "all") {
        query = query.eq("channel", direction);
      }

      // فلتر المقروء
      if (readState === "read") query = query.eq("is_read", true);
      if (readState === "unread") query = query.eq("is_read", false);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data;

      // فلتر النص
      if (search.trim() !== "") {
        filtered = filtered.filter((m) =>
          m.message.toLowerCase().includes(search.toLowerCase())
        );
      }

      // فلتر channel (WhatsApp / Telegram)
      if (channel !== "all") {
        filtered = filtered.filter((m) => m.channel === channel);
      }

      setMessages(filtered);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) fetchMessages();
  }, [clientId]);

  return (
    <div className="w-full">
      {/* ============================= */}
      {/* القسم الأول: عنوان + وصف + فلاتر */}
      {/* ============================= */}
      <h1 className="text-2xl font-bold mb-1">الرسائل</h1>
      <p className="text-gray-500 mb-6">
        هنا يمكنك استعراض كل الرسائل الواردة والصادرة لعميلك.
      </p>

      {/* الفلاتر */}
      <div className="bg-white shadow rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* بحث */}
          <input
            className="border p-2 rounded"
            placeholder="بحث في النص / المرسل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* نوع القناة */}
          <select
            className="border p-2 rounded"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="all">الكل (القنوات)</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>

          {/* direction */}
          <select
            className="border p-2 rounded"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="all">الكل (واردة/صادرة)</option>
            <option value="in">واردة</option>
            <option value="out">صادرة</option>
          </select>

          {/* حالة القراءة */}
          <select
            className="border p-2 rounded"
            value={readState}
            onChange={(e) => setReadState(e.target.value)}
          >
            <option value="all">الكل (القراءة)</option>
            <option value="read">مقروءة</option>
            <option value="unread">غير مقروءة</option>
          </select>
        </div>

        <button
          onClick={fetchMessages}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          تحديث
        </button>
      </div>

      {/* ============================= */}
      {/* القسم الثاني: جدول النتائج */}
      {/* ============================= */}
      <div className="bg-white shadow rounded-xl p-5">
        {loading ? (
          <p className="text-gray-500 text-center">جاري التحميل...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-sm">لا توجد رسائل مطابقة للفلاتر.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2 text-right">النص</th>
                <th className="py-2 text-right">القناة</th>
                <th className="py-2 text-right">الاتجاه</th>
                <th className="py-2 text-right">الحالة</th>
                <th className="py-2 text-right">التاريخ</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="py-2 max-w-xs truncate">{m.message}</td>
                  <td className="py-2">{m.channel}</td>
                  <td className="py-2">{m.channel === "in" ? "واردة" : "صادرة"}</td>
                  <td className="py-2">{m.is_read ? "✓ مقروءة" : "• غير مقروءة"}</td>
                  <td className="py-2 text-gray-500">
                    {new Date(m.created_at).toLocaleString("ar-EG")}
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
