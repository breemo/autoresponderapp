import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../layouts/AdminLayout";
import { Link } from "react-router-dom";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    email: "",
    plan_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMsg("");

    const { data: plansData } = await supabase
      .from("plans")
      .select("id, name, price");

    const { data: clientsData, error } = await supabase
      .from("clients")
      .select("id, business_name, email, plan_id, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMsg("❌ خطأ في جلب العملاء");
    }

    setPlans(plansData || []);
    setClients(clientsData || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const addClient = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.business_name || !form.email) {
      setMsg("⚠️ يرجى إدخال الاسم التجاري والإيميل");
      return;
    }

    const { error } = await supabase.from("clients").insert([
      {
        business_name: form.business_name,
        email: form.email,
        plan_id: form.plan_id || null,
        role: "client",
      },
    ]);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في إضافة العميل");
    } else {
      setMsg("✅ تم إضافة العميل بنجاح");
      setForm({ business_name: "", email: "", plan_id: "" });
      fetchData();
    }
  };

  const toggleStatus = async (id, currentRole) => {
    const newRole = currentRole === "disabled" ? "client" : "disabled";

    const { error } = await supabase
      .from("clients")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في تحديث حالة العميل");
    } else {
      setMsg("✅ تم تحديث الحالة");
      fetchData();
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في حذف العميل");
    } else {
      setMsg("🗑️ تم حذف العميل");
      fetchData();
    }
  };

  const getPlanName = (plan_id) => {
    const p = plans.find((pl) => pl.id === plan_id);
    return p ? `${p.name} (${p.price}$)` : "-";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة العملاء</h1>
      <p className="text-gray-500 mb-6">
        يمكنك إضافة عميل جديد، تفعيل/تعطيل، أو تعديل إعداداته.
      </p>

      {msg && <p className="mb-4 text-blue-700 font-semibold">{msg}</p>}

      {/* فورم إضافة عميل */}
      <form
        onSubmit={addClient}
        className="bg-white shadow rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end"
      >
        <div>
          <label className="block text-sm mb-1">الاسم التجاري</label>
          <input
            type="text"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-64"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-64"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">الخطة</label>
          <select
            name="plan_id"
            value={form.plan_id}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-56"
          >
            <option value="">بدون خطة</option>
            {plans.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name} - ${pl.price}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          إضافة عميل
        </button>
      </form>

      {/* جدول العملاء */}
      {loading ? (
        <p>جارِ تحميل العملاء...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-400">لا يوجد عملاء بعد.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">الاسم التجاري</th>
              <th className="p-3 text-left">الإيميل</th>
              <th className="p-3 text-left">الخطة</th>
              <th className="p-3 text-left">الحالة</th>
              <th className="p-3 text-center">الإعدادات</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50 text-sm">
                <td className="p-3">{c.business_name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{getPlanName(c.plan_id)}</td>
                <td className="p-3">
                  {c.role === "disabled" ? (
                    <span className="text-red-500 font-semibold">معطّل</span>
                  ) : (
                    <span className="text-green-600 font-semibold">مفعّل</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <Link
                    to={`/admin/client/${c.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    إعدادات العميل
                  </Link>
                </td>
                <td className="p-3 text-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => toggleStatus(c.id, c.role)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mx-1"
                  >
                    {c.role === "disabled" ? "تفعيل" : "تعطيل"}
                  </button>
                  <button
                    onClick={() => deleteClient(c.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mx-1"
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
  );
}
