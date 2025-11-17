import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Clients() {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    business_name: "",
    email: "",
    plan_id: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInitial();
  }, []);

  async function fetchInitial() {
    try {
      setLoading(true);

      const [{ data: plansData, error: plansError }, { data: clientsData, error: clientsError }] =
        await Promise.all([
          supabase.from("plans").select("id,name,price_per_month").order("price_per_month"),
          supabase
            .from("clients")
            .select("id,business_name,email,plan_id,is_active,role,created_at")
            .order("created_at", { ascending: false }),
        ]);

      if (plansError) throw plansError;
      if (clientsError) throw clientsError;

      setPlans(plansData || []);
      setClients(clientsData || []);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err.message);
      setError("حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ business_name: "", email: "", plan_id: "" });
    setEditingId(null);
    setError("");
  }

  function startEdit(client) {
    setForm({
      business_name: client.business_name || "",
      email: client.email || "",
      plan_id: client.plan_id || "",
    });
    setEditingId(client.id);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.business_name.trim()) {
      setError("الاسم التجاري مطلوب.");
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      setError("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }
    if (!form.plan_id) {
      setError("يرجى اختيار باقة للعميل.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const { error: updError } = await supabase
          .from("clients")
          .update({
            business_name: form.business_name.trim(),
            email: form.email.trim(),
            plan_id: form.plan_id,
          })
          .eq("id", editingId);

        if (updError) throw updError;
      } else {
        const { error: insError } = await supabase.from("clients").insert([
          {
            business_name: form.business_name.trim(),
            email: form.email.trim(),
            plan_id: form.plan_id,
            is_active: true,
            role: "client",
          },
        ]);

        if (insError) throw insError;
      }

      await fetchInitial();
      resetForm();
    } catch (err) {
      console.error("خطأ في حفظ العميل:", err.message);
      setError("حدث خطأ أثناء حفظ العميل.");
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

      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, is_active: !client.is_active } : c
        )
      );
    } catch (err) {
      console.error("خطأ في تغيير حالة العميل:", err.message);
      alert("تعذر تغيير حالة العميل.");
    }
  }

  async function handleDelete(client) {
    if (!window.confirm(`هل أنت متأكد من حذف العميل "${client.business_name}"؟`))
      return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", client.id);
      if (error) throw error;

      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch (err) {
      console.error("خطأ في حذف العميل:", err.message);
      alert("تعذر حذف العميل.");
    }
  }

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((c) => {
      const name = c.business_name?.toLowerCase() || "";
      const email = c.email?.toLowerCase() || "";
      return name.includes(term) || email.includes(term);
    });
  }, [clients, search]);

  const planMap = useMemo(() => {
    const m = new Map();
    plans.forEach((p) => m.set(p.id, p));
    return m;
  }, [plans]);

  if (loading) {
    return <Loader message="جارِ تحميل بيانات العملاء..." />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">العملاء</h1>
      <p className="text-gray-500 mb-6">
        يمكنك إضافة عميل جديد، تفعيل/تعطيل، تعديل أو حذف إعداداته.
      </p>

      {/* فورم إضافة/تعديل عميل */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          onSubmit={handleSave}
        >
          <div>
            <label className="block text-sm mb-1">الاسم التجاري</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.business_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, business_name: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الإيميل</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الباقة</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.plan_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, plan_id: e.target.value }))
              }
            >
              <option value="">اختر الباقة</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price_per_month}/mo
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg disabled:opacity-60"
            >
              {saving
                ? "جارِ الحفظ..."
                : editingId
                ? "تحديث بيانات العميل"
                : "إضافة عميل"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>

      {/* بحث + جدول العملاء */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">قائمة العملاء</h2>
          <input
            type="text"
            placeholder="بحث بالاسم أو الإيميل..."
            className="w-full md:w-64 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredClients.length === 0 ? (
          <p className="text-gray-400 text-sm">لا يوجد عملاء بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-gray-600">
                  <th className="py-2 text-right">الاسم التجاري</th>
                  <th className="py-2 text-right">الإيميل</th>
                  <th className="py-2 text-right">الباقة</th>
                  <th className="py-2 text-right">الحالة</th>
                  <th className="py-2 text-right">تاريخ الإنشاء</th>
                  <th className="py-2 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => {
                  const plan = planMap.get(c.plan_id);
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2">{c.business_name}</td>
                      <td className="py-2">{c.email}</td>
                      <td className="py-2">
                        {plan ? (
                          <>
                            {plan.name}{" "}
                            <span className="text-xs text-gray-400">
                              (${plan.price_per_month}/mo)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            بدون باقة
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        {c.is_active ? (
                          <span className="text-green-600 font-medium">
                            مفعّل
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            معطّل
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-gray-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("ar-EG")
                          : "-"}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => toggleActive(c)}
                            className={`px-2 py-1 rounded text-xs text-white ${
                              c.is_active
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-500 hover:bg-gray-600"
                            }`}
                          >
                            {c.is_active ? "تعطيل" : "تفعيل"}
                          </button>
                          <button
                            onClick={() => startEdit(c)}
                            className="px-2 py-1 rounded text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="px-2 py-1 rounded text-xs bg-red-500 hover:bg-red-600 text-white"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
