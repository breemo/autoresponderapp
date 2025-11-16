import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AutoReplies() {
  const [clients, setClients] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    trigger_text: "",
    reply_text: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [{ data: clientsData }, { data: repliesData }] = await Promise.all(
        [
          supabase.from("clients").select("id, business_name"),
          supabase
            .from("auto_replies")
            .select("id, client_id, trigger_text, reply_text, is_active, created_at")
            .order("created_at", { ascending: false }),
        ]
      );

      setClients(clientsData || []);
      setReplies(repliesData || []);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  function getClientName(id) {
    return clients.find((c) => c.id === id)?.business_name || "غير معروف";
  }

  async function addRule() {
    if (!form.client_id || !form.trigger_text || !form.reply_text) {
      setError("كل الحقول مطلوبة");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { error } = await supabase.from("auto_replies").insert({
        client_id: form.client_id,
        trigger_text: form.trigger_text,
        reply_text: form.reply_text,
        is_active: true,
      });

      if (error) throw error;

      setForm({ client_id: "", trigger_text: "", reply_text: "" });
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("فشل في إضافة الرد التلقائي");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(rule) {
    try {
      const { error } = await supabase
        .from("auto_replies")
        .update({ is_active: !rule.is_active })
        .eq("id", rule.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("فشل في تحديث حالة الرد");
    }
  }

  async function deleteRule(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الرد التلقائي؟")) return;

    try {
      const { error } = await supabase
        .from("auto_replies")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("فشل في حذف الرد التلقائي");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">الردود التلقائية</h2>
      <p className="text-gray-500 mb-6">
        إعداد وتعديل الردود التلقائية حسب الكلمات المفتاحية لكل عميل.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* إضافة رد تلقائي */}
      <div className="bg-white rounded-xl shadow mb-8 p-6 space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">العميل</label>
            <select
              value={form.client_id}
              onChange={(e) =>
                setForm({ ...form, client_id: e.target.value })
              }
              className="border rounded w-full px-3 py-2"
            >
              <option value="">اختر عميل...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">الكلمة/العبارة المحفِّزة</label>
            <input
              type="text"
              value={form.trigger_text}
              onChange={(e) =>
                setForm({ ...form, trigger_text: e.target.value })
              }
              className="border rounded w-full px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">نص الرد التلقائي</label>
            <input
              type="text"
              value={form.reply_text}
              onChange={(e) =>
                setForm({ ...form, reply_text: e.target.value })
              }
              className="border rounded w-full px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={addRule}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "جارِ الحفظ..." : "إضافة رد تلقائي"}
        </button>
      </div>

      {/* جدول الردود */}
      <div className="bg-white rounded-xl shadow p-6">
        {loading ? (
          <div className="text-gray-500 text-sm">جارِ تحميل الردود...</div>
        ) : replies.length === 0 ? (
          <div className="text-gray-400 text-sm">
            لا يوجد ردود تلقائية حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">العميل</th>
                  <th className="py-2 px-2">المحفّز</th>
                  <th className="py-2 px-2">الرد</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2">تاريخ الإنشاء</th>
                  <th className="py-2 px-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 px-2">{getClientName(r.client_id)}</td>
                    <td className="py-2 px-2">{r.trigger_text}</td>
                    <td className="py-2 px-2">{r.reply_text}</td>
                    <td className="py-2 px-2">
                      {r.is_active === false ? (
                        <span className="text-red-500">معطّل</span>
                      ) : (
                        <span className="text-green-600">مفعّل</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-500">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString("ar-EG")
                        : "-"}
                    </td>
                    <td className="py-2 px-2 text-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => toggleActive(r)}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mr-1"
                      >
                        {r.is_active === false ? "تفعيل" : "تعطيل"}
                      </button>
                      <button
                        onClick={() => deleteRule(r.id)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                      >
                        حذف
                      </button>
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
