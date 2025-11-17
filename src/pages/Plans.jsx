// src/pages/Plans.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FEATURE_OPTIONS = [
  "WhatsApp",
  "Telegram",
  "Facebook",
  "Instagram",
  "Website chat",
  "AI auto reply",
  "Email API",
];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // فورم الباقة
  const [form, setForm] = useState({
    name: "",
    price: "",
    max_messages: "",
    allow_login: true,
    allow_edit_replies: true,
    allow_settings: true,
    features: [],
  });

  // جلب الباقات
  async function fetchPlans() {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (error) throw error;

      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching plans:", err.message);
      setError("حدث خطأ أثناء جلب الباقات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  // تغييرات الفورم العادية
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  // إضافة ميزة (feature) من الـ dropdown
  function handleAddFeature(e) {
    const value = e.target.value;
    if (!value) return;

    setForm((prev) => {
      if (prev.features.includes(value)) return prev;
      return { ...prev, features: [...prev.features, value] };
    });

    // نرجع الـ select للوضع الفارغ
    e.target.value = "";
  }

  // حذف feature
  function removeFeature(feature) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  }

  // Reset فورم
  function resetForm() {
    setForm({
      name: "",
      price: "",
      max_messages: "",
      allow_login: true,
      allow_edit_replies: true,
      allow_settings: true,
      features: [],
    });
    setIsEditing(false);
    setEditingId(null);
  }

  // تعبئة الفورم للتعديل
  function startEdit(plan) {
    setIsEditing(true);
    setEditingId(plan.id);
    setError("");
    setSuccess("");

    setForm({
      name: plan.name || "",
      price: plan.price ?? "",
      max_messages: plan.max_messages ?? "",
      allow_login: plan.allow_login ?? true,
      allow_edit_replies: plan.allow_edit_replies ?? true,
      allow_settings: plan.allow_settings ?? true,
      features: Array.isArray(plan.features) ? plan.features : [],
    });
  }

  // حفظ (إضافة/تعديل)
  async function savePlan(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.name) {
        setError("الرجاء إدخال اسم الباقة");
        return;
      }

      const payload = {
        name: form.name,
        price: form.price === "" ? null : Number(form.price),
        max_messages:
          form.max_messages === "" ? null : Number(form.max_messages),
        allow_login: form.allow_login,
        allow_edit_replies: form.allow_edit_replies,
        allow_settings: form.allow_settings,
        features: form.features,
      };

      if (isEditing && editingId) {
        const { error } = await supabase
          .from("plans")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        setSuccess("✅ تم تعديل الباقة بنجاح");
      } else {
        const { error } = await supabase.from("plans").insert(payload);
        if (error) throw error;
        setSuccess("✅ تم إضافة الباقة بنجاح");
      }

      await fetchPlans();
      resetForm();
    } catch (err) {
      console.error("Error saving plan:", err.message);
      setError("حدث خطأ أثناء حفظ الباقة");
    } finally {
      setSaving(false);
    }
  }

  // حذف باقة
  async function deletePlan(id) {
    if (!window.confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;

    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
      setSuccess("🗑️ تم حذف الباقة بنجاح");
      await fetchPlans();
    } catch (err) {
      console.error("Error deleting plan:", err.message);
      setError("حدث خطأ أثناء حذف الباقة");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الباقات</h1>
      <p className="text-gray-500 mb-6">
        إدارة خطط الاشتراك، الصلاحيات، وعدد الرسائل المسموح بها لكل باقة.
      </p>

      {/* رسائل الحالة */}
      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
          {success}
        </div>
      )}

      {/* فورم إضافة/تعديل الباقة */}
      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? "تعديل الباقة" : "إضافة باقة جديدة"}
        </h2>

        <form onSubmit={savePlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-600">
              اسم الباقة
            </label>
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={handleChange}
              placeholder="مثال: Free, Pro, Business"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">السعر</label>
            <input
              type="number"
              name="price"
              className="w-full border rounded px-3 py-2"
              value={form.price}
              onChange={handleChange}
              placeholder="0 لو مجانية"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              الحد الأقصى للرسائل
            </label>
            <input
              type="number"
              name="max_messages"
              className="w-full border rounded px-3 py-2"
              value={form.max_messages}
              onChange={handleChange}
              placeholder="مثال: 1000"
            />
          </div>

          {/* صلاحيات */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm text-gray-600 mb-1">
              الصلاحيات (Permissions)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allow_login"
                checked={form.allow_login}
                onChange={handleChange}
              />
              <span>السماح بدخول لوحة التحكم</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allow_edit_replies"
                checked={form.allow_edit_replies}
                onChange={handleChange}
              />
              <span>السماح بتعديل الردود التلقائية</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allow_settings"
                checked={form.allow_settings}
                onChange={handleChange}
              />
              <span>السماح بالدخول لإعدادات الـ API</span>
            </label>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm text-gray-600">
              الميزات (Features)
            </label>
            <select
              onChange={handleAddFeature}
              className="border rounded px-3 py-2 mb-3 w-full md:w-1/2"
              defaultValue=""
            >
              <option value="">اختر ميزة لإضافتها</option>
              {FEATURE_OPTIONS.map((feat) => (
                <option key={feat} value={feat}>
                  {feat}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              {form.features.length === 0 && (
                <span className="text-gray-400 text-sm">
                  لا توجد ميزات مضافة بعد.
                </span>
              )}
              {form.features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => removeFeature(feat)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "جاري الحفظ..."
                : isEditing
                ? "حفظ التعديلات"
                : "إضافة الباقة"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>

      {/* جدول الباقات */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">كل الباقات</h2>

        {loading ? (
          <p className="text-gray-500">جارِ تحميل الباقات...</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-400">لا توجد باقات حالياً.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="py-2 px-2">الاسم</th>
                <th className="py-2 px-2">السعر</th>
                <th className="py-2 px-2">الرسائل</th>
                <th className="py-2 px-2">الصلاحيات</th>
                <th className="py-2 px-2">الميزات</th>
                <th className="py-2 px-2 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">{plan.name}</td>
                  <td className="py-2 px-2">
                    {plan.price == null ? "مجانية" : `${plan.price} $`}
                  </td>
                  <td className="py-2 px-2">
                    {plan.max_messages == null
                      ? "غير محدد"
                      : plan.max_messages}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col text-xs gap-1">
                      <span>
                        دخول:{" "}
                        {plan.allow_login ? (
                          <span className="text-green-600">مسموح</span>
                        ) : (
                          <span className="text-red-500">ممنوع</span>
                        )}
                      </span>
                      <span>
                        تعديل الردود:{" "}
                        {plan.allow_edit_replies ? (
                          <span className="text-green-600">مسموح</span>
                        ) : (
                          <span className="text-red-500">ممنوع</span>
                        )}
                      </span>
                      <span>
                        إعدادات API:{" "}
                        {plan.allow_settings ? (
                          <span className="text-green-600">مسموح</span>
                        ) : (
                          <span className="text-red-500">ممنوع</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((feat) => (
                          <span
                            key={feat}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        لا توجد ميزات
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => startEdit(plan)}
                        className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
