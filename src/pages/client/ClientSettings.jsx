import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientSettings() {
  const { user } = useAuth();
  const clientId = user?.client_id || user?.id;

  const [form, setForm] = useState({
    business_name: "",
    email: "",
    phone: "",
    address: "",
    business_description: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (data) {
      setForm({
        business_name: data.business_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        business_description: data.business_description || "",
        password: ""
      });
    }
  }

  async function handleSave() {
    setLoading(true);

    // تحديث بيانات العميل
    await supabase
      .from("clients")
      .update({
        business_name: form.business_name,
        phone: form.phone,
        address: form.address,
        business_description: form.business_description
      })
      .eq("id", clientId);

    // تحديث كلمة المرور إذا تم إدخالها
    if (form.password) {
      await supabase
        .from("users")
        .update({ password: form.password })
        .eq("id", user.id);
    }

    setLoading(false);
    alert("تم حفظ الإعدادات بنجاح ✅");
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">إعدادات الحساب</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">

        {/* الاسم */}
        <div>
          <label className="block mb-1">اسم النشاط</label>
          <input
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* الايميل (disabled) */}
        <div>
          <label className="block mb-1">البريد الإلكتروني</label>
          <input
            value={form.email}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            لتعديل البريد الإلكتروني يرجى التواصل مع الإدارة
          </p>
        </div>

        {/* الهاتف */}
        <div>
          <label className="block mb-1">رقم الهاتف</label>
          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* العنوان */}
        <div>
          <label className="block mb-1">العنوان</label>
          <input
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* الوصف */}
        <div>
          <label className="block mb-1">نبذة عن النشاط</label>
          <textarea
            value={form.business_description}
            onChange={(e) =>
              setForm({ ...form, business_description: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* الباسورد */}
        <div>
          <label className="block mb-1">كلمة المرور</label>
          <input
            type="password"
            placeholder="اتركه فارغ إذا لا تريد تغييره"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* زر الحفظ */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}
