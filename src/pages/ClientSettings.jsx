import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../App";

export default function ClientSettings() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    bot_token: "",
    chat_id: "",
    sheet_url: "",
    editable: true,
  });

  const [allowSelfEdit, setAllowSelfEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // جلب إعدادات العميل
      const { data: settings, error: settingsError } = await supabase
        .from("client_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }

      if (settings) {
        setForm({
          bot_token: settings.bot_token || "",
          chat_id: settings.chat_id || "",
          sheet_url: settings.sheet_url || "",
          editable:
            typeof settings.editable === "boolean" ? settings.editable : true,
        });
      }

      // جلب بيانات الخطة لمعرفة هل مسموح تعديل الإعدادات
      if (user.plan_id) {
        const { data: plan, error: planError } = await supabase
          .from("plans")
          .select("allow_self_edit")
          .eq("id", user.plan_id)
          .single();

        if (planError && planError.code !== "PGRST116") throw planError;

        if (plan) {
          setAllowSelfEdit(plan.allow_self_edit ?? true);
        }
      }
    } catch (err) {
      console.error("خطأ في جلب إعدادات العميل:", err.message);
      setError("حدث خطأ أثناء جلب الإعدادات.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!allowSelfEdit) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        user_id: user.id,
        bot_token: form.bot_token || null,
        chat_id: form.chat_id || null,
        sheet_url: form.sheet_url || null,
        editable: form.editable,
      };

      const { error } = await supabase
        .from("client_settings")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      setSuccess("✅ تم حفظ الإعدادات بنجاح.");
    } catch (err) {
      console.error("خطأ في حفظ الإعدادات:", err.message);
      setError("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const disabled = loading || saving || !allowSelfEdit;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إعدادات العميل</h1>
      <p className="text-gray-500 mb-6">
        إعداد تكامل البوت الخاص بك (Telegram / WhatsApp Bot / Google Sheet).
      </p>

      {!allowSelfEdit && (
        <div className="mb-4 bg-yellow-50 text-yellow-800 px-4 py-2 rounded border border-yellow-200 text-sm">
          لا يمكنك تعديل هذه الإعدادات من حساب العميل. الرجاء التواصل مع
          الإدارة لتعديلها.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded border border-green-200 text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">جارِ تحميل الإعدادات...</p>
      ) : (
        <form
          onSubmit={handleSave}
          className="bg-white shadow rounded-xl p-6 max-w-xl space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              Bot Token
            </label>
            <input
              type="password"
              className="border rounded px-3 py-2 text-sm w-full"
              value={form.bot_token}
              onChange={(e) => updateField("bot_token", e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">
              Chat ID
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              value={form.chat_id}
              onChange={(e) => updateField("chat_id", e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">
              Google Sheet URL
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm w-full"
              value={form.sheet_url}
              onChange={(e) => updateField("sheet_url", e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="editable"
              type="checkbox"
              className="h-4 w-4"
              checked={form.editable}
              onChange={(e) => updateField("editable", e.target.checked)}
              disabled={disabled}
            />
            <label htmlFor="editable" className="text-sm text-gray-700">
              السماح للنظام بتعديل الملف تلقائياً (حسب الخطة)
            </label>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className={`px-6 py-2 rounded text-sm font-semibold text-white ${
              disabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </form>
      )}
    </div>
  );
}
