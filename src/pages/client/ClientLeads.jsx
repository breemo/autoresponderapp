import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientLeads() {
  const { user } = useAuth();
  const clientId = user?.client_id || user?.id;

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");

  async function fetchLeads() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLeads(data || []);
    } catch (err) {
      console.error(err);
      setError("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clientId) fetchLeads();
  }, [clientId]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search.trim() ||
        `${lead.name || ""} ${lead.phone || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesPlatform =
        platform === "all" || lead.platform === platform;

      return matchesSearch && matchesPlatform;
    });
  }, [leads, search, platform]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Leads</h1>
        <p className="text-gray-500">
          قائمة العملاء الذين تم جمع بياناتهم.
        </p>
      </div>

      <div className="bg-white shadow p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="بحث بالاسم أو الرقم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="all">كل المنصات</option>
            <option value="facebook">Facebook</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          <button
            onClick={fetchLeads}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      )}

      <div className="bg-white shadow rounded-xl p-4">
        {loading ? (
          <p className="text-gray-500 text-center">جارِ التحميل...</p>
        ) : filteredLeads.length === 0 ? (
          <p className="text-gray-400 text-center">لا يوجد Leads</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2">الاسم</th>
                  <th className="py-2">الرقم</th>
                  <th className="py-2">المنصة</th>
                  <th className="py-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="py-2">
                      {lead.name || "—"}
                    </td>
                    <td className="py-2">
                      {lead.phone || "—"}
                    </td>
                    <td className="py-2">
                      {lead.platform || "—"}
                    </td>
                    <td className="py-2">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString("ar-EG")
                        : "—"}
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
