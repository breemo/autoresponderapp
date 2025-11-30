import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminClientSettings() {
  const { id: clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    setLoading(true);
    setMsg("");

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error) {
      console.error(error);
      setMsg("❌ فشل في جلب بيانات العميل");
    } else {
      setClient(data);
    }

    setLoading(false);
  }

  async function updateClient() {
    setMsg("");

    const { error } = await supabase
      .from("clients")
      .update({
        business_name: client.business_name,
        email: client.email,
        plan_id: client.plan_id,
        is_active: client.is_active,
      })
      .eq("id", clientId);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في تحديث بيانات العميل");
    } else {
      setMsg("✔️ تم تحديث بيانات العميل");
    }
  }

  if (loading) return <p>جاري تحميل بيانات العميل...</p>;
  if (!client) return <p>❌ لم يتم العثور على العميل</p>;

  return (
    <div className="p-6 max-w-lg bg-white shadow rounded-xl">
      <h1 className="text-xl font-bold mb-4">إعدادات العميل</h1>

      {msg && <p className="mb-4 font-semibold">{msg}</p>}

      <label className="block mb-2">الاسم التجاري</label>
      <input
        type="text"
        value={client.business_name}
        onChange={(e) =>
          setClient({ ...client, business_name: e.target.value })
        }
        className="border p-2 w-full mb-4 rounded"
      />

      <label className="block mb-2">الإيميل</label>
      <input
        type="email"
        value={client.email}
        onChange={(e) => setClient({ ...client, email: e.target.value })}
        className="border p-2 w-full mb-4 rounded"
      />

      <label className="block mb-2">الخطة</label>
      <input
        type="text"
        value={client.plan_id}
        onChange={(e) => setClient({ ...client, plan_id: e.target.value })}
        className="border p-2 w-full mb-4 rounded"
      />

      <label className="block mb-2">الحالة</label>
      <select
        value={client.is_active}
        onChange={(e) =>
          setClient({ ...client, is_active: e.target.value === "true" })
        }
        className="border p-2 w-full mb-4 rounded"
      >
        <option value="true">مفعّل</option>
        <option value="false">معطّل</option>
      </select>

      <button
        onClick={updateClient}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        حفظ التعديلات
      </button>
    </div>
  );
}
