import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../App";

export default function ClientAutoReplies() {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [triggerText, setTriggerText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchReplies() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("auto_replies")
        .select("id, trigger_text, reply_text, is_active, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReplies(data || []);
    } catch (err) {
      console.error("خطأ في جلب الردود:", err.message);
      setError("حدث خطأ أثناء جلب الردود التلقائية.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddReply(e) {
    e.preventDefault();
    if (!triggerText.trim() || !replyText.trim()) {
      setError("الرجاء إدخال نص التفعيل ونص الرد.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { error } = await supabase.from("auto_replies").insert({
        client_id: user.id,
        trigger_text: triggerText.trim(),
        reply_text: replyText.trim(),
        is_active: true,
      });

      if (error) throw error;

      setTriggerText("");
      setReplyText("");
      fetchReplies();
    } catch (err) {
      console.error("خطأ في إضافة الرد:", err.message);
      setError("حدث خطأ أثناء إضافة الرد التلقائي.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id, current) {
    try {
      const { error } = await supabase
        .from("auto_replies")
        .update({ is_active: !current })
        .eq("id", id)
        .eq("client_id", user.id);

      if (error) throw error;
      fetchReplies();
    } catch (err) {
      console.error("خطأ في تحديث حالة الرد:", err.message);
      setError("حدث خطأ أثناء تحديث حالة الرد.");
    }
  }

  async function deleteReply(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الرد التلقائي؟")) return;

    try {
      const { error } = await supabase
        .from("auto_replies")
        .delete()
        .eq("id", id)
        .eq("client_id", user.id);

      if (error) throw error;
      fetchReplies();
    } catch (err) {
      console.error("خطأ في حذف الرد:", err.message);
      setError("حدث خطأ أثناء حذف الرد التلقائي.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الردود التلقائية</h1>
      <p className="text-gray-500 mb-6">
        يمكنك إضافة أو تعديل أو تفعيل/تعطيل الردود التلقائية الخاصة بك.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* نموذج إضافة رد */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">إضافة رد تلقائي جديد</h2>
        <form onSubmit={handleAddReply} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              نص التفعيل (Trigger)
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              value={triggerText}
              onChange={(e) => setTriggerText(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-sm text-gray-700">
              نص الرد
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded mt-2 md:mt-0"
          >
            {saving ? "جاري الحفظ..." : "إضافة رد"}
          </button>
        </form>
      </div>

      {/* قائمة الردود */}
      {loading ? (
        <p className="text-gray-500">جارِ تحميل الردود...</p>
      ) : replies.length === 0 ? (
        <p className="text-gray-400 text-sm">لا توجد ردود تلقائية بعد.</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-gray-600">
                <th className="py-2 px-3 text-right">نص التفعيل</th>
                <th className="py-2 px-3 text-right">نص الرد</th>
                <th className="py-2 px-3 text-right">الحالة</th>
                <th className="py-2 px-3 text-right">التاريخ</th>
                <th className="py-2 px-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 max-w-xs truncate">
                    {r.trigger_text}
                  </td>
                  <td className="py-2 px-3 max-w-md truncate">
                    {r.reply_text}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => toggleActive(r.id, r.is_active)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        r.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.is_active ? "مفعّل" : "معطّل"}
                    </button>
                  </td>
                  <td className="py-2 px-3 text-gray-500">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString("ar-EG")
                      : "-"}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => deleteReply(r.id)}
                      className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
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
  );
}
