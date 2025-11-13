import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setMsg("");
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error(error);
      setMsg("❌ خطأ في جلب الباقات");
    } else {
      setPlans(data || []);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const addPlan = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.price) {
      setMsg("⚠️ الرجاء إدخال اسم الخطة والسعر");
      return;
    }

    const { error } = await supabase.from("plans").insert([
      {
        name: form.name,
        price: Number(form.price),
        description: form.description || null,
      },
    ]);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في إضافة الخطة");
    } else {
      setMsg("✅ تم إضافة الخطة بنجاح");
      setForm({ name: "", price: "", description: "" });
      fetchPlans();
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخطة؟")) return;

    const { error } = await supabase.from("plans").delete().eq("id", id);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في حذف الخطة");
    } else {
      setMsg("🗑️ تم حذف الخطة");
      fetchPlans();
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">إدارة الباقات</h1>
      <p className="text-gray-500 mb-6">
        أضف، عدّل، واحذف الباقات المتاحة لعملائك.
      </p>

      {msg && <p className="mb-4 text-blue-700 font-semibold">{msg}</p>}

      {/* فورم إضافة خطة */}
      <form
        onSubmit={addPlan}
        className="bg-white shadow rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end"
      >
        <div>
          <label className="block text-sm mb-1">اسم الخطة</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-64"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">السعر (بالدولار)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-40"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">الوصف (اختياري)</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-80"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          إضافة خطة
        </button>
      </form>

      {/* جدول الباقات */}
      {plans.length === 0 ? (
        <p className="text-gray-400">لا توجد باقات بعد.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">اسم الخطة</th>
              <th className="p-3 text-left">السعر</th>
              <th className="p-3 text-left">الوصف</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50 text-sm">
                <td className="p-3">{p.name}</td>
                <td className="p-3">${p.price}</td>
                <td className="p-3">
                  {p.description || <span className="text-gray-400">-</span>}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deletePlan(p.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
