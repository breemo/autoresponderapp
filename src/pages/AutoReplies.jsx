import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

export default function AutoReplies() {
  const [replies, setReplies] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client_id: "",
    trigger_text: "",
    reply_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [{ data: repliesData }, { data: clientsData }] = await Promise.all(
          [
            supabase
              .from("auto_replies")
              .select(
                "id, client_id, trigger_text, reply_text, is_active, created_at, clients ( business_name )"
              )
              .order("created_at", { ascending: false }),
            supabase
              .from("clients")
              .select("id, business_name")
              .order("business_name"),
          ]
        );

        setReplies(repliesData || []);
        setClients(clientsData || []);
      } catch (err) {
        console.error("Error loading auto replies", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.client_id || !form.trigger_text || !form.reply_text) return;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("auto_replies")
        .insert({
          client_id: form.client_id,
          trigger_text: form.trigger_text,
          reply_text: form.reply_text,
          is_active: true,
        })
        .select("id, client_id, trigger_text, reply_text, is_active, created_at")
        .single();

      if (error) throw error;

      const client = clients.find((c) => c.id === data.client_id);
      setReplies((prev) => [
        {
          ...data,
          clients: client ? { business_name: client.business_name } : null,
        },
        ...prev,
      ]);
      setForm({ client_id: "", trigger_text: "", reply_text: "" });
    } catch (err) {
      console.error("Error adding auto reply", err);
      alert("فشل في إضافة الرد التلقائي");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id, current) {
    try {
      const { error } = await supabase
        .from("auto_replies")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) throw error;

      setReplies((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r))
      );
    } catch (err) {
      console.error("Error toggling auto reply", err);
      alert("فشل في التعديل");
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        الردود التلقائية
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        إدارة القواعد التي يقوم النظام بالرد من خلالها تلقائياً.
      </p>

      {/* نموذج إضافة رد تلقائي */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col gap-3"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-64">
            <label className="block text-xs text-gray-500 mb-1">العميل</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              value={form.client_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, client_id: e.target.value }))
              }
            >
              <option value="">اختر العميل</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">
              النص المُحفِّز
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              value={form.trigger_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, trigger_text: e.target.value }))
              }
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">نص الرد</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              value={form.reply_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, reply_text: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md min-w-[140px]"
          >
            {saving ? "جاري الحفظ..." : "إضافة رد تلقائي"}
          </button>
        </div>
      </form>

      {/* جدول الردود */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-right">العميل</th>
              <th className="px-4 py-3 text-right">النص المُحفِّز</th>
              <th className="px-4 py-3 text-right">نص الرد</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {replies.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  لا توجد ردود تلقائية بعد.
                </td>
              </tr>
            )}
            {replies.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{r.clients?.business_name || "-"}</td>
                <td className="px-4 py-3">{r.trigger_text}</td>
                <td className="px-4 py-3">{r.reply_text}</td>
                <td className="px-4 py-3">
                  {r.is_active ? (
                    <span className="text-green-600">مفعل</span>
                  ) : (
                    <span className="text-gray-400">موقوف</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActive(r.id, r.is_active)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    تبديل الحالة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
