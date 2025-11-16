import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { supabase } from "../lib/supabaseClient";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    client_id: "",
    direction: "",
  });

  // تحميل البيانات
  const fetchData = async () => {
    setLoading(true);

    // جلب العملاء
    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, business_name");

    setClients(clientsData || []);

    // جلب الرسائل
    let query = supabase
      .from("messages")
      .select("*, clients(business_name)")
      .order("created_at", { ascending: false });

    if (filters.client_id) query.eq("client_id", filters.client_id);
    if (filters.direction) query.eq("direction", filters.direction);

    const { data: msgData } = await query;
    setMessages(msgData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📩 الرسائل المرسلة</h1>

      {/* الفلاتر */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4">
        <select
          className="border p-2 rounded"
          value={filters.client_id}
          onChange={(e) =>
            setFilters({ ...filters, client_id: e.target.value })
          }
        >
          <option value="">كل العملاء</option>
          {clients.map((c) => (
            <option value={c.id} key={c.id}>
              {c.business_name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={filters.direction}
          onChange={(e) =>
            setFilters({ ...filters, direction: e.target.value })
          }
        >
          <option value="">كل الأنواع</option>
          <option value="incoming">📥 واردة</option>
          <option value="outgoing">📤 صادرة</option>
        </select>
      </div>

      {/* جدول الرسائل */}
      <div className="bg-white p-6 rounded-xl shadow">
        {loading ? (
          <p>جارِ التحميل...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400">لا يوجد رسائل.</p>
        ) : (
          <table className="w-full text-right">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">العميل</th>
                <th className="py-2">النص</th>
                <th className="py-2">الاتجاه</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b text-sm">
                  <td className="py-2">
                    {m.clients?.business_name || "-"}
                  </td>

                  <td className="py-2">{m.text}</td>

                  <td className="py-2">
                    {m.direction === "incoming" ? (
                      <span className="text-blue-600">📥 واردة</span>
                    ) : (
                      <span className="text-green-600">📤 صادرة</span>
                    )}
                  </td>

                  <td className="py-2">{m.status || "-"}</td>

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
    </AdminLayout>
  );
}
