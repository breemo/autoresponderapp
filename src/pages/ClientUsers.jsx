import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";

export default function ClientUsers() {
  const { clientId } = useParams();

  const [client, setClient] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setError("");
      setLoading(true);

      // جلب بيانات العميل
      const { data: clientData } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      setClient(clientData);

      // جلب المستخدمين المرتبطين فيه
      const { data: userLinks } = await supabase
        .from("client_users")
        .select("user_id")
        .eq("client_id", clientId);

      if (!userLinks || userLinks.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = userLinks.map((x) => x.user_id);

      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);

      setUsers(usersData || []);
    } catch (err) {
      setError("فشل في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function addUser(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.name || !form.password) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    try {
      // 1) إنشاء user
      const { data: user, error: userErr } = await supabase
        .from("users")
        .insert({
          email: form.email,
          name: form.name,
          password: form.password,
          role: "client",
        })
        .select()
        .single();

      if (userErr) throw userErr;

      // 2) ربطه مع العميل
      const { error: linkErr } = await supabase
        .from("client_users")
        .insert({
          client_id: clientId,
          user_id: user.id,
        });

      if (linkErr) throw linkErr;

      setSuccess("تم إضافة المستخدم وربطه بالعميل");
      setForm({ email: "", name: "", password: "" });
      fetchData();
    } catch (err) {
      setError("حدث خطأ أثناء الإضافة");
    }
  }

  async function resetPassword(userId) {
    const pass = prompt("أدخل كلمة المرور الجديدة:");

    if (!pass) return;

    const { error } = await supabase
      .from("users")
      .update({ password: pass })
      .eq("id", userId);

    if (error) setError("لم يتم التحديث");
    else setSuccess("تم تحديث كلمة المرور بنجاح");
  }

  async function removeUser(userId) {
    if (!window.confirm("هل تريد إزالة هذا المستخدم؟")) return;

    const { error } = await supabase
      .from("client_users")
      .delete()
      .eq("client_id", clientId)
      .eq("user_id", userId);

    if (error) setError("لم يتم الحذف");
    else {
      setSuccess("تم إزالة المستخدم");
      fetchData();
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-3">
        مستخدمو العميل: {client?.business_name}
      </h1>

      {error && (
        <div className="mb-3 bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 bg-green-100 text-green-700 px-4 py-2 rounded">
          {success}
        </div>
      )}

      {/* إضافة مستخدم */}
      <div className="bg-white shadow rounded-xl p-5 mb-6">
        <h2 className="text-lg mb-3">إضافة مستخدم جديد</h2>

        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={addUser}>
          <div>
            <label>الاسم</label>
            <input
              type="text"
              name="name"
              className="border rounded w-full px-3 py-2"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>الإيميل</label>
            <input
              type="email"
              name="email"
              className="border rounded w-full px-3 py-2"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>كلمة المرور</label>
            <input
              type="password"
              name="password"
              className="border rounded w-full px-3 py-2"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-end">
            <button className="bg-blue-600 text-white w-full py-2 rounded">
              إضافة
            </button>
          </div>
        </form>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-lg mb-4">قائمة المستخدمين</h2>

        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">لا يوجد مستخدمين.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2">الاسم</th>
                <th className="py-2">البريد</th>
                <th className="py-2">دور المستخدم</th>
                <th className="py-2 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="text-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => resetPassword(u.id)}
                      className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
                    >
                      Reset Password
                    </button>

                    <button
                      onClick={() => removeUser(u.id)}
                      className="px-3 py-1 bg-red-200 text-red-700 rounded text-xs"
                    >
                      إزالة
                    </button>
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
