import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  async function loadClients() {
    const { data } = await supabase
      .from("clients")
      .select("id, business_name, email")
      .order("business_name", { ascending: true });

    setClients(data || []);
  }

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      let query = supabase
        .from("messages")
        .select("*, clients:client_id(business_name,email)")
        .order("created_at", { ascending: false });

      // Filter by client
      if (clientFilter !== "all") query = query.eq("client_id", clientFilter);

      // Filter by channel
      if (channelFilter !== "all") query = query.eq("channel", channelFilter);

      // Filter by direction
      if (directionFilter !== "all")
        query = query.eq("direction", directionFilter);

      // Filter by read status
      if (readFilter === "read") query = query.eq("is_read", true);
      if (readFilter === "unread") query = query.eq("is_read", false);

      const { data, error } = await query;

      if (error) throw error;

      let filtered = data;

      // Search filter
      if (search.trim()) {
        filtered = filtered.filter((m) =>
          `${m.sender} ${m.message}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }

      setMessages(filtered);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    loadMessages();
  }, []);

  // pagination calc
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = messages.slice(start, end);
  const pageCount = Math.ceil(messages.length / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">كل رسائل النظام</h1>
      <p className="text-gray-500 mb-6">إشراف كامل على رسائل جميع العملاء.</p>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-5 mb-8">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">

          {/* Search */}
          <input
            className="border p-2 rounded"
            placeholder="بحث عالمي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Client filter */}
          <select
            className="border p-2 rounded"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="all">كل العملاء</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name} ({c.email})
              </option>
            ))}
          </select>

          {/* Channel */}
          <select
            className="border p-2 rounded"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">كل القنوات</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>

          {/* Direction */}
          <select
            className="border p-2 rounded"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
          >
            <option value="all">واردة وصادرة</option>
            <option value="in">واردة</option>
            <option value="out">صادرة</option>
          </select>

          {/* Read state */}
          <select
            className="border p-2 rounded"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="read">مقروءة</option>
            <option value="unread">غير مقروءة</option>
          </select>

        </div>

        <button
          onClick={loadMessages}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          تحديث
        </button>
      </div>

      {/* Messages table */}
      <div className="bg-white shadow rounded-xl p-5">

        {loading ? (
          <p>جاري التحميل...</p>
        ) : paginated.length === 0 ? (
          <p className="text-gray-400">لا توجد رسائل مطابقة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2">العميل</th>
                <th className="py-2">القناة</th>
                <th className="py-2">الاتجاه</th>
                <th className="py-2">النص</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="py-2">
                    {m.clients?.business_name || "—"}
                  </td>
                  <td className="py-2">{m.channel}</td>
                  <td className="py-2">
                    {m.direction === "in" ? "واردة" : "صادرة"}
                  </td>
                  <td className="py-2 truncate max-w-xs">{m.message}</td>
                  <td className="py-2">
                    {m.is_read ? "✓ مقروءة" : "• غير مقروءة"}
                  </td>
                  <td className="py-2 text-gray-500">
                    {new Date(m.created_at).toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-3 mt-4">
            <button
              className="px-3 py-1 border rounded"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              السابق
            </button>

            <span className="px-3 py-1">
              {page} / {pageCount}
            </span>

            <button
              className="px-3 py-1 border rounded"
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
