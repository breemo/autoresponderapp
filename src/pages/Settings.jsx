import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

export default function Settings() {
  const [settings, setSettings] = useState({
    id: 1,
    smtp_host: "",
    smtp_port: "",
    api_key: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("id", 1)
          .single();

        if (!error && data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error loading settings", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase.from("settings").upsert(settings, {
        onConflict: "id",
      });
      if (error) throw error;
      alert("✅ تم حفظ الإعدادات بنجاح");
    } catch (err) {
      console.error("Error saving settings", err);
      alert("فشل في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        ⚙️ إعدادات النظام
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        إعدادات البريد وواجهة البرمجة الخاصة بنظام الرد الآلي.
      </p>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            SMTP Host
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={settings.smtp_host}
            onChange={(e) =>
              setSettings((s) => ({ ...s, smtp_host: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            SMTP Port
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={settings.smtp_port}
            onChange={(e) =>
              setSettings((s) => ({ ...s, smtp_port: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            API Key
          </label>
          <input
            type="password"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={settings.api_key}
            onChange={(e) =>
              setSettings((s) => ({ ...s, api_key: e.target.value }))
            }
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md min-w-[140px]"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
