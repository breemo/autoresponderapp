import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../App";

const { user } = useAuth();
const clientId = user?.client_id || user?.id;

export default function ClientAutoReplies() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    trigger_text: "",
    reply_text: "",
    is_active: true,
  });

  useEffect(() => {
    if (!user) return;
    fetchReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchReplies() {
    try {
      setLoading(true);
      setError("");

      const { data, error: replError } = await supabase
        .from("auto_replies")
        .select("id, trigger_text, reply_text, is_active, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (replError) throw replError;

      setReplies(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في تحميل الردود التلقائية");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(r) {
    setForm({
      id: r.id,
      trigger_text: r.trigger_text || "",
      reply_text: r.reply_text || "",
      is_active: r.is_active,
    });
  }

  function resetForm() {
    setForm({
      id: null,
      trigger_text: "",
      reply_text: "",
      is_active: true,
    });
  }

  async function saveReply() {
    if (!form.trigger_text || !form.reply_text) {
      setError("نص التريغر ونص الرد مطلوبان");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (form.id) {
        // تعديل
        const { error: updError } = await supabase
          .from("auto_replies")
          .update({
            trigger_text: form.trigger_text,
            reply_text: form.reply_text,
            is_active: form.is_active,
          })
          .eq("id", form.id)
          .eq("client_id", clientId);

        if (updError) throw updError;
      } else {
        // إضافة
        const { error: insError } = await supabase.from("auto_replies").insert([
          {
            client_id: user.id,
            trigger_text: form.trigger_text,
            reply_text: form.reply_text,
            is_active: form.is_active,
          },
        ]);

        if (insError) throw insError;
      }

      resetForm();
      fetchReplies();
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في حفظ الرد التلقائي");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r) {
    try {
      const { error: updError } = await supabase
        .from("auto_replies")
        .update({ is_active: !r.is_active })
        .eq("id", r.id)
        .eq("client_id", clientId);

      if (updError) throw updError;

      fetchReplies();
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في تحديث الحالة");
    }
  }

  async function deleteReply(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الرد التلقائي؟")) return;

    try {
      const { error: delError } = await supabase
        .from("auto_replies")
        .delete()
        .eq("id", id)
        .eq("client_id", clientId);

      if (delError) throw delError;

      fetchReplies();
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في حذف الرد التلقائي");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">الردود التلقائية</h1>
      <p className="text-gray-500 mb-6">
        يمكنك إعداد الردود التلقائية التي يردّ بها النظام على رسائل عملائك.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* الفورم */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {form.id ? "تعديل رد تلقائي" : "إضافة رد تلقائي جديد"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              نص التريغر (الكلمة/الجملة المحفّزة)
            </label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={form.trigger_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, trigger_text: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              حالة الرد
            </label>
            <select
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={form.is_active ? "1" : "0"}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.value === "1" }))
              }
            >
              <option value="1">مفعّل</option>
              <option value="0">معطّل</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            نص الرد التلقائي
          </label>
          <textarea
            className="border rounded-lg px-3 py-2 w-full text-sm min-h-[80px]"
            value={form.reply_text}
            onChange={(e) =>
              setForm((f) => ({ ...f, reply_text: e.target.value }))
            }
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveReply}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
          >
            {form.id ? "حفظ التعديلات" : "إضافة الرد"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </div>

      {/* القائمة */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">قائمة الردود التلقائية</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">جارِ تحميل البيانات...</p>
        ) : replies.length === 0 ? (
          <p className="text-gray-400 text-sm">لا يوجد ردود تلقائية بعد.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-gray-500">
              <tr>
                <th className="py-2 text-right">التريغر</th>
                <th className="py-2 text-right">نص الرد</th>
                <th className="py-2 text-right">الحالة</th>
                <th className="py-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="py-2 max-w-xs truncate">
                    {r.trigger_text}
                  </td>
                  <td className="py-2 max-w-xs truncate">
                    {r.reply_text}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleActive(r)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.is_active ? "مفعّل" : "معطّل"}
                    </button>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(r)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteReply(r.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        حذف
                      </button>
                    </div>
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
