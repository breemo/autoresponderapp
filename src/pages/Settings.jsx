import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Settings() {
  const [settings, setSettings] = useState({
    smtp_host: "",
    smtp_port: "",
    api_key: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("settings")
        .select("smtp_host, smtp_port, api_key")
        .single();

      if (error && error.code !== "PGRST116") throw error; // لا يوجد صف
      if (data) setSettings(data);
    } catch (err) {
      console.error("خطأ في جلب الإعدادات:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase.from("settings").upsert(settings);
      if (error) throw error;

      setMessage("✅ تم حفظ الإعدادات بنجاح");
    } catch (err) {
      console.error(err);
      setMessage("❌ فشل في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">⚙️ إعدادات النظام</h2>
      <p className="text-gray-500 mb-6">
        إعدادات التكامل (SMTP / API) الخاصة بنظام AutoResponder.
      </p>

      {loading ? (
        <div className="text-gray-500 text-sm">جارِ تحميل الإعدادات...</div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow w-full md:w-1/2 space-y-4 text-sm">
          {message && (
            <div
              className={`px-3 py-2 rounded text-sm ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <label className="block mb-1">SMTP Host</label>
            <input
              type="text"
              className="border w-full rounded px-3 py-2"
              value={settings.smtp_host}
              onChange={(e) =>
                setSettings({ ...settings, smtp_host: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1">SMTP Port</label>
            <input
              type="text"
              className="border w-full rounded px-3 py-2"
              value={settings.smtp_port}
              onChange={(e) =>
                setSettings({ ...settings, smtp_port: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block mb-1">API Key</label>
            <input
              type="password"
              className="border w-full rounded px-3 py-2"
              value={settings.api_key}
              onChange={(e) =>
                setSettings({ ...settings, api_key: e.target.value })
              }
            />
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "جارِ الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      )}
    </div>
  );
}
