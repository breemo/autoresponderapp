import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Messages() {
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clientFilter, setClientFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, clientFilter, directionFilter]);

  async function fetchData() {
    try {
      setLoading(true);

      const [{ data: clientsData }, { data: messagesData }] = await Promise.all(
        [
          supabase.from("clients").select("id, business_name"),
          supabase
            .from("messages")
            .select("id, client_id, text, direction, status, created_at")
            .order("created_at", { ascending: false }),
        ]
      );

      setClients(clientsData || []);
      setMessages(messagesData || []);
    } catch (err) {
      console.error("خطأ في جلب الرسائل:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let data = [...messages];

    if (clientFilter) {
      data = data.filter((m) => m.client_id === clientFilter);
    }

    if (directionFilter) {
      data = data.filter((m) => m.direction === directionFilter);
    }

    setFiltered(data);
  }

  function getClientName(id) {
    return clients.find((c) => c.id === id)?.business_name || "غير معروف";
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">الرسائل المرسلة / المستلمة</h2>
      <p className="text-gray-500 mb-6">
        عرض ومتابعة الرسائل الخاصة بالعملاء مع إمكانية الفلترة حسب العميل
        والاتجاه.
      </p>

      {/* فلاتر */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 text-sm">
        <div>
          <label className="block mb-1">العميل</label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">كل العملاء</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.business_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">الاتجاه</label>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">الكل</option>
            <option value="in">واردة</option>
            <option value="out">صادرة</option>
          </select>
        </div>
      </div>

      {/* جدول الرسائل */}
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? (
          <div className="text-gray-500 text-sm">جارِ تحميل الرسائل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400 text-sm">
            لا توجد رسائل مطابقة للفلتر.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">العميل</th>
                  <th className="py-2 px-2">النص</th>
                  <th className="py-2 px-2">الاتجاه</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2 px-2">{getClientName(m.client_id)}</td>
                    <td className="py-2 px-2 max-w-xs truncate">{m.text}</td>
                    <td className="py-2 px-2">
                      {m.direction === "out" ? "صادرة" : "واردة"}
                    </td>
                    <td className="py-2 px-2">{m.status || "-"}</td>
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
      </div>
    </div>
  );
}
