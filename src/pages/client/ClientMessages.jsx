import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientMessages() {
  const { user } = useAuth();

  // client id
  const clientId = user?.client_id || user?.id;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [direction, setDirection] = useState("all");
  const [readState, setReadState] = useState("all");

  async function fetchMessages() {
    try {
      setLoading(true);
      setError("");

      let query = supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      // direction
      if (direction !== "all") query = query.eq("direction", direction);

      // read state
      if (readState === "read") query = query.eq("is_read", true);
      if (readState === "unread") query = query.eq("is_read", false);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];

      // Channel
      if (channel !== "all") {
        filtered = filtered.filter((m) => m.channel === channel);
      }

      // Search
      if (search.trim()) {
        filtered = filtered.filter((m) =>
          `${m.sender} ${m.message}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }

      setMessages(filtered);
    } catch (err) {
      setError("فشل في جلب الرسائل");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {
  console.log("🔵 Client ID =", clientId);
  if (clientId) fetchMessages();
}, [clientId]);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">الرسائل</h1>
      <p className="text-gray-500 mb-6">
        استعرض الرسائل الواردة والصادرة الخاصة بك.
      </p>

      {/* Filters */}
      <div className="bg-white shadow p-5 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

          <input
            className="border p-2 rounded"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="all">كل القنوات</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>

          <select
            className="border p-2 rounded"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="all">واردة وصادرة</option>
            <option value="in">واردة</option>
            <option value="out">صادرة</option>
          </select>

          <select
            className="border p-2 rounded"
            value={readState}
            onChange={(e) => setReadState(e.target.value)}
          >
            <option value="all">الكل</option>
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

      {/* Messages */}
      <div className="bg-white shadow rounded-xl p-5">
        {loading ? (
          <p className="text-gray-500 text-center">جارِ التحميل...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-sm">لا توجد رسائل.</p>
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
                <tr key={m.id} className="border-b">
                  <td className="py-2">{m.message}</td>
                  <td className="py-2">{m.channel}</td>
                  <td className="py-2">{m.direction === "in" ? "واردة" : "صادرة"}</td>
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
