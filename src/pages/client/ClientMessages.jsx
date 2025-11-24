import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../App";

const { user } = useAuth();
const clientId = user?.client_id || user?.id;

export default function ClientMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError("");

      const { data, error: msgError } = await supabase
        .from("messages")
        .select("id, text, direction, status, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (msgError) throw msgError;

      setMessages(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  }

  const filtered = messages.filter((m) => {
    if (directionFilter !== "all" && m.direction !== directionFilter) {
      return false;
    }
    if (search && !m.text?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">الرسائل</h1>
      <p className="text-gray-500 mb-6">
        هنا يمكنك استعراض كل الرسائل الواردة والصادرة لحسابك.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
          >
            <option value="all">كل الاتجاهات</option>
            <option value="in">واردة</option>
            <option value="out">صادرة</option>
          </select>

          <button
            onClick={fetchMessages}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            تحديث
          </button>
        </div>

        <input
          type="text"
          placeholder="بحث في نص الرسالة..."
          className="border rounded-lg px-3 py-2 text-sm w-full md:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white shadow rounded-xl p-4">
        {loading ? (
          <p className="text-gray-500 text-sm">جارِ تحميل الرسائل...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">لا توجد رسائل مطابقة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2 text-right">النص</th>
                <th className="py-2 text-right">الاتجاه</th>
                <th className="py-2 text-right">الحالة</th>
                <th className="py-2 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="py-2 max-w-xs truncate">{m.text}</td>
                  <td className="py-2">
                    {m.direction === "in" ? "واردة" : "صادرة"}
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {m.status || "-"}
                    </span>
                  </td>
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
