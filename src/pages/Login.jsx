import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    // 1) Auth login
    const { data, error: err1 } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err1) {
      setError("خطأ في تسجيل الدخول");
      return;
    }

    const authUser = data.user;

    // 2) جلب بيانات العميل من Table: clients
    const { data: clientRow, error: err2 } = await supabase
      .from("clients")
      .select("id, business_name, email, plan_id")
      .eq("email", email)
      .single();

    if (err2) {
      setError("المستخدم غير موجود في جدول العملاء");
      return;
    }

    // 3) دمج بيانات supabase user + clientRow
    const finalUser = {
      uid: authUser.id,
      email: authUser.email,
      client_id: clientRow.id,  // 🎯 هذا أهم شيء
      business_name: clientRow.business_name,
      plan_id: clientRow.plan_id,
    };

    // 4) تخزين
    localStorage.setItem("user", JSON.stringify(finalUser));
    setUser(finalUser);

    // 5) عمل redirect
    window.location.href = "/client/dashboard";
  }

  return (
    <div>
      <h1>Login</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="البريد"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>تسجيل الدخول</button>
      </form>
    </div>
  );
}
