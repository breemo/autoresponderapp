import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { supabase } from "../lib/supabaseClient";

export default function AutoReplies() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    trigger_text: "",
    reply_text: "",
  });

  useEffect(() => {
    fetchReplies();
  }, []);

  async function fetchReplies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auto_replies")
        .select("id, trigger_text, reply_text, is_active, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReplies(data || []);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل الردود التلقائية");
    } finally {
      setLoading(false);
    }
  }

  async function addReply() {
    if (!form.trigger_text || !form.reply_text) {
      setError("نص التفعيل ونص الرد مطلوبان");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { error } = await supabase.from("auto_replies").insert({
        trigger_text: form.trigger_text,
        reply_text: form.reply_text,
        is_active: true,
      });

      if (error) throw error;
      setForm({ trigger_text: "", reply_text: "" });
      await fetchReplies();
    } catch (err) {
      console.error(err);
      setError("فشل في إضافة الرد");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(reply) {
    try {
      const { error } = await supabase
        .from("auto_replies")
        .update({ is_active: !reply.is_active })
        .eq("id", reply.id);

      if (error) throw error;
      await fetchReplies();
    } catch (err) {
      console.error(err);
      setError("فشل في تحديث حالة الرد");
    }
  }

  async function deleteReply(reply) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الرد؟")) return;

    try {
      const { error } = await supabase
        .from("auto_replies")
        .delete()
        .eq("id", reply.id);

      if (error) throw error;
      await fetchReplies();
    } catch (err) {
      console.error(err);
      setError("فشل في حذف الرد");
    }
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">الردود التلقائية</h2>
      <p className="text-gray-500 mb-6">
        إدارة القواعد التي يتم من خلالها الرد تلقائياً على رسائل العملاء.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* نموذج إضافة رد */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">➕ إضافة رد تلقائي جديد</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">نص التفعيل (Trigger)</label>
            <input
              type="text"
              className="border w-full rounded px-3 py-2 text-sm"
              value={form.trigger_text}
              onChange={(e) =>
                setForm({ ...form, trigger_text: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">نص الرد</label>
            <input
              type="text"
              className="border w-full rounded px-3 py-2 text-sm"
              value={form.reply_text}
              onChange={(e) =>
                setForm({ ...form, reply_text: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={addReply}
          disabled={saving}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "جارِ الحفظ..." : "حفظ الرد"}
        </button>
      </div>

      {/* جدول الردود */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">قائمة الردود التلقائية</h3>

        {loading ? (
          <p className="text-gray-500 text-sm">جارِ تحميل الردود...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-400 text-sm">لا يوجد ردود حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">نص التفعيل</th>
                  <th className="py-2 px-2">نص الرد</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{r.trigger_text}</td>
                    <td className="py-2 px-2">{r.reply_text}</td>
                    <td className="py-2 px-2">
                      {r.is_active === false ? (
                        <span className="text-red-500">معطّل</span>
                      ) : (
                        <span className="text-green-600">مفعّل</span>
                      )}
                    </td>
                    <td className="py-2 px-2 flex gap-2 justify-center">
                      <button
                        onClick={() => toggleActive(r)}
                        className={`px-3 py-1 rounded text-white text-xs ${
                          r.is_active === false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                      >
                        {r.is_active === false ? "تفعيل" : "تعطيل"}
                      </button>
                      <button
                        onClick={() => deleteReply(r)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
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
    </AdminLayout>
  );
}
