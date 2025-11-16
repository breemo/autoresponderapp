import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { supabase } from "../lib/supabaseClient";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // فورم العميل الجديد
  const [form, setForm] = useState({
    business_name: "",
    email: "",
    role: "active",
    plan_id: null,
  });

  const [plans, setPlans] = useState([]);

  // جلب البيانات
  const loadData = async () => {
    setLoading(true);

    const { data: planData } = await supabase.from("plans").select("*");
    setPlans(planData || []);

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    setClients(clientData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // إضافة عميل
  const addClient = async () => {
    if (!form.business_name || !form.email) {
      alert("جميع الحقول مطلوبة ❗");
      return;
    }

    const { error } = await supabase.from("clients").insert([
      {
        business_name: form.business_name,
        email: form.email,
        role: form.role,
        plan_id: form.plan_id || null,
      },
    ]);

    if (error) {
      alert("❌ فشل في إضافة العميل");
    } else {
      alert("✅ تم إضافة العميل بنجاح");
      setForm({ business_name: "", email: "", role: "active", plan_id: null });
      loadData();
    }
  };

  // حذف عميل
  const deleteClient = async (id) => {
    if (!window.confirm("هل تريد حذف هذا العميل؟")) return;

    await supabase.from("clients").delete().eq("id", id);
    loadData();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">👥 إدارة العملاء</h1>

      {/* فورم الإضافة */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="font-semibold mb-4">➕ إضافة عميل جديد</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="الاسم التجاري"
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
          >
            <option value="">اختر الباقة</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - ${p.price}
              </option>
            ))}
          </select>

          <button
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            onClick={addClient}
          >
            إضافة عميل
          </button>
        </div>
      </div>

      {/* جدول العملاء */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">📋 قائمة العملاء</h2>

        {loading ? (
          <p>جارِ التحميل...</p>
        ) : clients.length === 0 ? (
          <p className="text-gray-400">لا يوجد عملاء بعد.</p>
        ) : (
          <table className="w-full text-right">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">الاسم التجاري</th>
                <th className="py-2">الإيميل</th>
                <th className="py-2">الباقة</th>
                <th className="py-2">الحالة</th>
                <th className="py-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b text-sm">
                  <td className="py-2">{c.business_name}</td>
                  <td className="py-2">{c.email}</td>
                  <td className="py-2">{plans.find((p) => p.id === c.plan_id)?.name || "-"}</td>
                  <td className="py-2">
                    {c.role === "disabled" ? (
                      <span className="text-red-500">معطّل</span>
                    ) : (
                      <span className="text-green-600">مفعّل</span>
                    )}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => deleteClient(c.id)}
                      className="text-red-500 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
