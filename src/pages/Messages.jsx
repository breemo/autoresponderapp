import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("messages")
          .select(
            "id, text, direction, status, created_at, clients ( business_name )"
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Error loading messages", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        الرسائل المرسلة
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        آخر 100 رسالة تم تسجيلها في النظام.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-right">العميل</th>
              <th className="px-4 py-3 text-right">النص</th>
              <th className="px-4 py-3 text-right">الاتجاه</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  لا توجد رسائل بعد.
                </td>
              </tr>
            )}
            {messages.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{m.clients?.business_name || "-"}</td>
                <td className="px-4 py-3 max-w-xs truncate" title={m.text}>
                  {m.text}
                </td>
                <td className="px-4 py-3">
                  {m.direction === "out" ? "صادرة" : "واردة"}
                </td>
                <td className="px-4 py-3">{m.status || "-"}</td>
                <td className="px-4 py-3">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("ar-EG")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
