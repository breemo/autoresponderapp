import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminAutoReplies() {
  const [replies, setReplies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadClients() {
    const { data } = await supabase
      .from("clients")
      .select("id, business_name");
    setClients(data || []);
  }

  async function loadReplies() {
    try {
      setLoading(true);

      let query = supabase
        .from("auto_replies")
        .select("*, clients:client_id(business_name)")
        .order("created_at", { ascending: false });

      // Filter by client
      if (clientFilter !== "all") {
        query = query.eq("client_id", clientFilter);
      }

      // Filter by activation
      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }

      const { data } = await query;

      let filtered = data || [];

      // Search
      if (search.trim()) {
        filtered = filtered.filter((r) =>
          `${r.trigger_text} ${r.reply_text}`
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }

      setReplies(filtered);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    loadReplies();
  }, []);

  async function toggleActive(row) {
    await supabase
      .from("auto_replies")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);

    loadReplies();
  }

  async function deleteReply(id) {
    if (!window.confirm("هل تريد حذف هذا الرد؟")) return;
    await supabase.from("auto_replies").delete().eq("id", id);
    loadReplies();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">كل الردود التلقائية</h1>
      <p className="text-gray-500 mb-6">
        تحكم بالردود التلقائية لجميع العملاء.
      </p>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

          {/* Search */}
          <input
            className="border p-2 rounded"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filter by client */}
          <select
            className="border p-2 rounded"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="all">كل العملاء</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="active">مفعلة</option>
            <option value="inactive">معطلة</option>
          </select>

          <button
            onClick={loadReplies}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            تحديث
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl p-5">
        {loading ? (
          <p>جارِ التحميل...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-400">لا توجد ردود مطابقة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th>العميل</th>
                <th>التريغر</th>
                <th>الرد</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.clients?.business_name || "—"}</td>
                  <td className="py-2">{r.trigger_text}</td>
                  <td className="py-2 max-w-xs truncate">{r.reply_text}</td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleActive(r)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.is_active ? "مفعلة" : "معطلة"}
                    </button>
                  </td>
                  <td className="py-2">{new Date(r.created_at).toLocaleString("ar-EG")}</td>
                  <td className="py-2 text-red-600 hover:underline text-xs cursor-pointer"
                      onClick={() => deleteReply(r.id)}>
                    حذف
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
