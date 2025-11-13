import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "../layouts/AdminLayout";

export default function Settings() {
  const [settings, setSettings] = useState({
    smtp_host: "",
    smtp_port: "",
    api_key: "",
  });

  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*").single();
    if (data) setSettings(data);
  };

  const saveSettings = async () => {
    await supabase.from("settings").upsert(settings);
    alert("✅ تم حفظ الإعدادات بنجاح");
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          ⚙️ إعدادات النظام
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-md w-full md:w-1/2">
          <label className="block mb-2">SMTP Host</label>
          <input
            type="text"
            className="border w-full rounded px-3 py-2 mb-4"
            value={settings.smtp_host}
            onChange={(e) =>
              setSettings({ ...settings, smtp_host: e.target.value })
            }
          />

          <label className="block mb-2">SMTP Port</label>
          <input
            type="text"
            className="border w-full rounded px-3 py-2 mb-4"
            value={settings.smtp_port}
            onChange={(e) =>
              setSettings({ ...settings, smtp_port: e.target.value })
            }
          />

          <label className="block mb-2">API Key</label>
          <input
            type="password"
            className="border w-full rounded px-3 py-2 mb-4"
            value={settings.api_key}
            onChange={(e) =>
              setSettings({ ...settings, api_key: e.target.value })
            }
          />

          <button
            onClick={saveSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
