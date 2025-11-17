import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../App";

export default function ClientSettings() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    business_name: "",
    email: "",
    plan_id: "",
    is_active: true,
  });
  const [password, setPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchProfile() {
    try {
      setError("");
      const { data, error: profError } = await supabase
        .from("clients")
        .select("business_name, email, plan_id, is_active")
        .eq("id", user.id)
        .single();

      if (profError) throw profError;
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في تحميل بيانات الحساب");
    }
  }

  async function saveProfile() {
    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      const { error: updError } = await supabase
        .from("clients")
        .update({
          business_name: profile.business_name,
          is_active: profile.is_active,
        })
        .eq("id", user.id);

      if (updError) throw updError;

      // تحديث الـ user في الذاكرة و localStorage
      const newUser = { ...user, ...profile };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      setMessage("تم حفظ بيانات الحساب بنجاح");
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في حفظ بيانات الحساب");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!password || password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");

      const { error: updError } = await supabase
        .from("clients")
        .update({ password })
        .eq("id", user.id);

      if (updError) throw updError;

      setPassword("");
      setMessage("تم تحديث كلمة المرور بنجاح");
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل في تحديث كلمة المرور");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">إعدادات الحساب</h1>
      <p className="text-gray-500 mb-6">
        هنا يمكنك تعديل بيانات حسابك وتحديث كلمة المرور.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* بيانات الحساب */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">بيانات الحساب</h2>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">
              الاسم التجاري
            </label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={profile.business_name || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, business_name: e.target.value }))
              }
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="border rounded-lg px-3 py-2 w-full text-sm bg-gray-50"
              value={profile.email || ""}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">
              الخطة الحالية
            </label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full text-sm bg-gray-50"
              value={profile.plan_id || ""}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={profile.is_active}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, is_active: e.target.checked }))
                }
              />
              <span>الحساب مفعّل</span>
            </label>
          </div>

          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
          >
            حفظ التعديلات
          </button>
        </div>

        {/* كلمة المرور */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">تغيير كلمة المرور</h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">
              كلمة مرور جديدة
            </label>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={changePassword}
            disabled={savingPassword}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
          >
            تحديث كلمة المرور
          </button>
        </div>
      </div>
    </div>
  );
}
