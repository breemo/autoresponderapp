import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { supabase } from "../lib/supabaseClient";

export default function Settings() {
  const [settings, setSettings] = useState({
    smtp_host: "",
    smtp_port: "",
    api_key: "",
  });
  const [showApi, setShowApi] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error; // no rows
      if (data) setSettings(data);
    } catch (err) {
      console.error(err);
      setMessage("فشل في تحميل إعدادات النظام");
    }
  }

  async function saveSettings() {
    try {
      setMessage("");

      const { error } = await supabase.from("settings").upsert(settings);
      if (error) throw error;

      setMessage("✅ تم حفظ الإعدادات بنجاح");
    } catch (err) {
      console.error(err);
      setMessage("❌ فشل في حفظ الإعدادات");
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-2">إعدادات النظام العامة</h2>
      <p className="text-gray-500 mb-6 text-sm">
        هذه الإعدادات تخص النظام ككل (ليس عميل واحد). يمكن استخدامها مثلاً
        لإرسال إشعارات Email من النظام أو مفاتيح تكامل عامة.
      </p>

      {message && (
        <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded px-4 py-2">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow w-full md:w-2/3">
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            SMTP Host (خادم البريد)
          </label>
          <input
            type="text"
            className="border w-full rounded px-3 py-2 text-sm"
            value={settings.smtp_host || ""}
            onChange={(e) =>
              setSettings({ ...settings, smtp_host: e.target.value })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            مثال: <code>smtp.gmail.com</code> أو خادم مزود الخدمة.
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">SMTP Port</label>
          <input
            type="number"
            className="border w-full rounded px-3 py-2 text-sm"
            value={settings.smtp_port || ""}
            onChange={(e) =>
              setSettings({ ...settings, smtp_port: e.target.value })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            عادة 587 أو 465 حسب مزود خدمة البريد.
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            API Key عام للنظام
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showApi ? "text" : "password"}
              className="border flex-1 rounded px-3 py-2 text-sm"
              value={settings.api_key || ""}
              onChange={(e) =>
                setSettings({ ...settings, api_key: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowApi((prev) => !prev)}
              className="text-xs px-3 py-2 rounded border bg-gray-50 hover:bg-gray-100"
            >
              {showApi ? "إخفاء" : "إظهار"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            يمكن استخدامه كمفتاح تكامل مع خدمات خارجية أو Webhooks عامة.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          حفظ الإعدادات
        </button>
      </div>
    </AdminLayout>
  );
}
