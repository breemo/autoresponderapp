import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminClientSettings() {
  const { id } = useParams(); // client id
  const [client, setClient] = useState(null);
  const [settings, setSettings] = useState({
    bot_token: "",
    chat_id: "",
    sheet_url: "",
    editable: false,
  });
  const [settingsRowId, setSettingsRowId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setMsg("");

    // بيانات العميل
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id, business_name, email")
      .eq("id", id)
      .single();

    if (clientError) {
      console.error(clientError);
      setMsg("❌ لم يتم العثور على هذا العميل");
      setLoading(false);
      return;
    }

    setClient(clientData);

    // إعدادات هذا العميل
    const { data: settingsData, error: settingsError } = await supabase
      .from("client_settings")
      .select("id, bot_token, chat_id, sheet_url, editable")
      .eq("client_id", id)
      .maybeSingle();

    if (settingsError) {
      console.error(settingsError);
      setMsg("⚠️ تعذر جلب إعدادات العميل (سيتم إدخال إعدادات جديدة)");
    }

    if (settingsData) {
      setSettings({
        bot_token: settingsData.bot_token || "",
        chat_id: settingsData.chat_id || "",
        sheet_url: settingsData.sheet_url || "",
        editable: !!settingsData.editable,
      });
      setSettingsRowId(settingsData.id);
    } else {
      // لا يوجد إعدادات مسبقاً
      setSettings({
        bot_token: "",
        chat_id: "",
        sheet_url: "",
        editable: false,
      });
      setSettingsRowId(null);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      if (settingsRowId) {
        // تحديث
        const { error } = await supabase
          .from("client_settings")
          .update({
            bot_token: settings.bot_token,
            chat_id: settings.chat_id,
            sheet_url: settings.sheet_url,
            editable: settings.editable,
          })
          .eq("id", settingsRowId);

        if (error) throw error;
      } else {
        // إدخال جديد
        const { data, error } = await supabase
          .from("client_settings")
          .insert([
            {
              client_id: id,
              bot_token: settings.bot_token,
              chat_id: settings.chat_id,
              sheet_url: settings.sheet_url,
              editable: settings.editable,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;
        setSettingsRowId(data.id);
      }

      setMsg("✅ تم حفظ إعدادات العميل بنجاح");
    } catch (err) {
      console.error(err);
      setMsg("❌ حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  return (
    <div>
      {loading ? (
        <p>جارِ تحميل بيانات العميل...</p>
      ) : !client ? (
        <p className="text-red-500">{msg || "لم يتم العثور على العميل"}</p>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-2">
            إعدادات العميل: {client.business_name}
          </h1>
          <p className="text-gray-500 mb-6">{client.email}</p>

          {msg && <p className="mb-4 text-blue-700 font-semibold">{msg}</p>}

          <form
            onSubmit={saveSettings}
            className="bg-white shadow rounded-xl p-6 w-full md:w-2/3"
          >
            <div className="mb-4">
              <label className="block mb-1 text-sm">Telegram Bot Token</label>
              <input
                type="text"
                name="bot_token"
                value={settings.bot_token}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                placeholder="123456:ABC-DEF..."
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm">Chat ID</label>
              <input
                type="text"
                name="chat_id"
                value={settings.chat_id}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                placeholder="مثال: 123456789"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm">رابط Google Sheet</label>
              <input
                type="text"
                name="sheet_url"
                value={settings.sheet_url}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                placeholder="https://docs.google.com/spreadsheets/..."
              />
            </div>

            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="editable"
                name="editable"
                checked={settings.editable}
                onChange={handleChange}
              />
              <label htmlFor="editable" className="text-sm">
                السماح للعميل بتعديل إعداداته بنفسه
              </label>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              حفظ الإعدادات
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
