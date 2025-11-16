import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    email: "",
    plan_id: "",
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  async function fetchInitial() {
    try {
      setLoading(true);
      setError("");

      const [{ data: clientsData }, { data: plansData }] = await Promise.all([
        supabase
          .from("clients")
          .select("id, business_name, email, is_active, plan_id, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("plans").select("id, name, price"),
      ]);

      setClients(clientsData || []);
      setPlans(plansData || []);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  async function addClient() {
  if (!form.business_name || !form.email) {
    setError("الاسم التجاري والإيميل مطلوبان");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("clients").insert({
      business_name: form.business_name,
      email: form.email,
      plan_id: form.plan_id || null,
      is_active: true,
    });

    if (insertError) throw insertError;

    setForm({ business_name: "", email: "", plan_id: "" });
    await fetchInitial();
  } catch (err) {
    console.error(err);
    setError("فشل في إضافة العميل");
  } finally {
    setSaving(false);
  }
}


  async function toggleActive(client) {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ is_active: !client.is_active })
        .eq("id", client.id);

      if (error) throw error;
      await fetchInitial();
    } catch (err) {
      console.error(err);
      setError("فشل في تحديث حالة العميل");
    }
  }

  async function deleteClient(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      await fetchInitial();
    } catch (err) {
      console.error(err);
      setError("فشل في حذف العميل");
    }
  }

  function getPlanLabel(plan_id) {
    const p = plans.find((pl) => pl.id === plan_id);
    if (!p) return "-";
    return `${p.name} - $${p.price ?? 0}`;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">إدارة العملاء</h2>
      <p className="text-gray-500 mb-6">
        يمكنك إضافة عميل جديد، تفعيل/تعطيل، أو تعديل إعدادات الاشتراك.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* إضافة عميل جديد */}
      <div className="bg-white rounded-xl shadow mb-8 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">الاسم التجاري</label>
            <input
              type="text"
              className="border rounded w-full px-3 py-2 text-sm"
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              className="border rounded w-full px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الخطة</label>
            <select
              className="border rounded w-full px-3 py-2 text-sm"
              value={form.plan_id}
              onChange={(e) =>
                setForm({ ...form, plan_id: e.target.value })
              }
            >
              <option value="">بدون خطة</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price ?? 0}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={addClient}
          disabled={saving}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "جارِ الحفظ..." : "إضافة عميل"}
        </button>
      </div>

      {/* قائمة العملاء */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">قائمة العملاء</h3>

        {loading ? (
          <div className="text-gray-500 text-sm">جارِ تحميل العملاء...</div>
        ) : clients.length === 0 ? (
          <div className="text-gray-400 text-sm">لا يوجد عملاء بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">الاسم التجاري</th>
                  <th className="py-2 px-2">الإيميل</th>
                  <th className="py-2 px-2">الخطة</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2">تاريخ الإنشاء</th>
                  <th className="py-2 px-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2 px-2">{c.business_name}</td>
                    <td className="py-2 px-2">{c.email}</td>
                    <td className="py-2 px-2">
                      {getPlanLabel(c.plan_id)}
                    </td>
                    <td className="py-2 px-2">
                      {c.is_active === false ? (
                        <span className="text-red-500">معطّل</span>
                      ) : (
                        <span className="text-green-600">مفعّل</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-500">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("ar-EG")
                        : "-"}
                    </td>
                    <td className="py-2 px-2 text-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => toggleActive(c)}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mr-1"
                      >
                        {c.is_active === false ? "تفعيل" : "تعطيل"}
                      </button>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
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
    </div>
  );
}
