import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminFeatures() {
    const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    fields: [],
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error(error);
    else setFeatures(data || []);

    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      fields: [],
    });
    setEditingId(null);
    setMsg("");
  };

  const handleFieldChange = (index, key, value) => {
    setForm((prev) => {
      const newFields = [...prev.fields];
      newFields[index][key] = value;
      return { ...prev, fields: newFields };
    });
  };

  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, { name: "", type: "text" }],
    }));
  };

  const removeField = (index) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({
      name: f.name,
      slug: f.slug,
      description: f.description || "",
      fields: Object.entries(f.fields || {}).map(([name, type]) => ({
        name,
        type,
      })),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.slug) {
      setMsg("⚠️ يرجى إدخال الاسم والـ slug");
      return;
    }

    const fieldsJson = {};
    form.fields.forEach((f) => {
      if (f.name.trim() !== "") fieldsJson[f.name] = f.type;
    });

    try {
      if (editingId) {
        const { error } = await supabase
          .from("features")
          .update({
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            fields: fieldsJson,
          })
          .eq("id", editingId);

        if (error) throw error;
        setMsg("✅ تم تحديث الميزة بنجاح");
      } else {
        const { error } = await supabase.from("features").insert([
          {
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            fields: fieldsJson,
          },
        ]);

        if (error) throw error;
        setMsg("✅ تم إضافة الميزة بنجاح");
      }

      resetForm();
      fetchFeatures();
    } catch (err) {
      console.error(err);
      setMsg("❌ حدث خطأ أثناء الحفظ");
    }
  };

  const deleteFeature = async (id) => {
    if (!window.confirm("هل تريد حذف هذه الميزة؟")) return;

    const { error } = await supabase.from("features").delete().eq("id", id);

    if (error) {
      console.error(error);
      setMsg("❌ فشل في حذف الميزة");
    } else {
      setMsg("🗑️ تم الحذف بنجاح");
      fetchFeatures();
      resetForm();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة المميزات (Features)</h1>
      <p className="text-gray-500 mb-6">
        يمكنك إضافة وتعديل الحقول الخاصة بكل ميزة.
      </p>

      {msg && <p className="mb-4 text-blue-700 font-semibold">{msg}</p>}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-4 mb-8 flex flex-col gap-4"
      >
        <div className="flex gap-4">
          <div>
            <label className="block text-sm mb-1">اسم الميزة</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 w-60"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">الوصف (اختياري)</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="font-semibold">الحقول المطلوبة لهذه الميزة:</label>

          {form.fields.map((field, index) => (
            <div key={index} className="flex gap-4 my-2">
              <input
                type="text"
                placeholder="field name"
                value={field.name}
                onChange={(e) =>
                  handleFieldChange(index, "name", e.target.value)
                }
                className="border rounded px-3 py-2 w-60"
              />

              <select
                value={field.type}
                onChange={(e) =>
                  handleFieldChange(index, "type", e.target.value)
                }
                className="border rounded px-3 py-2 w-40"
              >
                <option value="text">Text</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="url">URL</option>
              </select>

              <button
                type="button"
                onClick={() => removeField(index)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                حذف
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="bg-gray-600 text-white px-3 py-1 rounded"
          >
            + إضافة حقل
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 mt-4"
        >
          {editingId ? "تحديث الميزة" : "إضافة ميزة"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 w-fit"
          >
            إلغاء التعديل
          </button>
        )}
      </form>

      {/* Features List */}
      <table className="w-full bg-white shadow rounded-xl">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">الاسم</th>
            <th className="p-3 text-left">Slug</th>
            <th className="p-3 text-left">الحقول</th>
            <th className="p-3 text-center">إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {features.map((f) => (
            <tr key={f.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{f.name}</td>
              <td className="p-3">{f.slug}</td>
              <td className="p-3 text-sm">
                {Object.keys(f.fields || {}).length === 0
                  ? "-"
                  : Object.entries(f.fields || {}).map(([k, v]) => (
                      <div key={k}>
                        {k} ({v})
                      </div>
                    ))}
              </td>
              <td className="p-3 text-center space-x-2">
                <button
                  onClick={() => startEdit(f)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  تعديل
                </button>
                <button
                  onClick={() => deleteFeature(f.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
