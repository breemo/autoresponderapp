import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Loader from "../components/Loader";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    business_name: "",
    email: "",
    plan_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [{ data: clientsData }, { data: plansData }] = await Promise.all([
          supabase
            .from("clients")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.from("plans").select("*").order("price", { ascending: true }),
        ]);

        setClients(clientsData || []);
        setPlans(plansData || []);
      } catch (err) {
        console.error("Error loading clients", err);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleAddClient(e) {
    e.preventDefault();
    setError("");

    if (!form.business_name || !form.email || !form.plan_id) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    try {
      setSaving(true);

      const { data, error: insertError } = await supabase
        .from("clients")
        .insert({
          business_name: form.business_name,
          email: form.email,
          plan_id: form.plan_id,
          role: "client",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setClients((prev) => [data, ...prev]);
      setForm({ business_name: "", email: "", plan_id: "" });
    } catch (err) {
      console.error("Error adding client", err);
      setError("فشل في إضافة العميل");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting client", err);
      alert("فشل في حذف العميل");
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        إدارة العملاء
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        يمكنك إضافة عميل جديد، أو إدارة العملاء الحاليين.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* نموذج إضافة عميل */}
      <form
        onSubmit={handleAddClient}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            الاسم التجاري
          </label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={form.business_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, business_name: e.target.value }))
            }
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />
        </div>

        <div className="w-full md:w-56">
          <label className="block text-xs text-gray-500 mb-1">الخطة</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            value={form.plan_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, plan_id: e.target.value }))
            }
          >
            <option value="">اختر الخطة</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - {plan.price ?? 0}$
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md min-w-[130px]"
        >
          {saving ? "جاري الإضافة..." : "إضافة عميل"}
        </button>
      </form>

      {/* جدول العملاء */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-right">الاسم التجاري</th>
              <th className="px-4 py-3 text-right">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right">الخطة</th>
              <th className="px-4 py-3 text-right">تاريخ الإنشاء</th>
              <th className="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  لا يوجد عملاء بعد.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{client.business_name}</td>
                <td className="px-4 py-3">{client.email}</td>
                <td className="px-4 py-3">{client.plan_id}</td>
                <td className="px-4 py-3">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString("ar-EG")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
