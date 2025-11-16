import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
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
    setLoading(true);
    try {
      const [{ data: clientsData, error: cErr }, { data: plansData, error: pErr }] =
        await Promise.all([
          supabase
            .from("clients")
            .select("id, business_name, email, plan_id, is_active, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("plans").select("id, name"),
        ]);

      if (cErr) throw cErr;
      if (pErr) throw pErr;

      setClients(clientsData || []);
      setPlans(plansData || []);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل بيانات العملاء أو الباقات");
    } finally {
      setLoading(false);
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function addClient() {
    if (!form.business_name || !form.email) {
      setError("الاسم التجاري والإيميل مطلوبان");
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // التحقق من أن الإيميل غير مكرر
      const { data: existing, error: existingErr } = await supabase
        .from("clients")
        .select("id")
        .eq("email", form.email);

      if (existingErr) throw existingErr;
      if (existing && existing.length > 0) {
        setError("هذا الإيميل مستخدم بالفعل لعميل آخر");
        setSaving(false);
        return;
      }

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

  async function deleteClient(client) {
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id);

      if (error) throw error;
      await fetchInitial();
    } catch (err) {
      console.error(err);
      setError("فشل في حذف العميل");
    }
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-4">العملاء</h2>
      <p className="text-gray-500 mb-6">
        إدارة عملاء نظام Auto Responder وتعيين الباقات لهم.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded px-4 py-2 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* نموذج إضافة عميل جديد */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">➕ إضافة عميل جديد</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1">الاسم التجاري</label>
            <input
              type="text"
              className="border w-full rounded px-3 py-2 text-sm"
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الإيميل</label>
            <input
              type="email"
              className="border w-full rounded px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الباقة</label>
            <select
              className="border w-full rounded px-3 py-2 text-sm"
              value={form.plan_id}
              onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
            >
              <option value="">بدون باقة</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={addClient}
          disabled={saving}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "جارِ الحفظ..." : "حفظ العميل"}
        </button>
      </div>

      {/* جدول العملاء */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">قائمة العملاء</h3>

        {loading ? (
          <p className="text-gray-500 text-sm">جارِ تحميل العملاء...</p>
        ) : clients.length === 0 ? (
          <p className="text-gray-400 text-sm">لا يوجد عملاء حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-2">الاسم التجاري</th>
                  <th className="py-2 px-2">الإيميل</th>
                  <th className="py-2 px-2">الباقة</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{c.business_name}</td>
                    <td className="py-2 px-2">{c.email}</td>
                    <td className="py-2 px-2">
                      {plans.find((p) => p.id === c.plan_id)?.name ||
                        "بدون باقة"}
                    </td>
                    <td className="py-2 px-2">
                      {c.is_active === false ? (
                        <span className="text-red-500">معطّل</span>
                      ) : (
                        <span className="text-green-600">مفعّل</span>
                      )}
                    </td>
                    <td className="py-2 px-2 flex gap-2 justify-center">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`px-3 py-1 rounded text-white text-xs ${
                          c.is_active === false
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                      >
                        {c.is_active === false ? "تفعيل" : "تعطيل"}
                      </button>
                      <button
                        onClick={() => deleteClient(c)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
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
    </AdminLayout>
  );
}
