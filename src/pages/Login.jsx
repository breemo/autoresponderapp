// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import supabase from "../lib/supabaseClient";   // ✅ تصحيح الاستدعاء
import { useAuth } from "../App";               // ⚠ مؤقتًا صحيح، لكن سنعدله لاحقًا

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !user) {
      setMessage("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    setMessage(
      `مرحبا ${
        user.role === "admin" ? "بالمدير" : "بالعميل"
      }، سيتم تحويلك الآن`
    );

    setTimeout(() => {
      navigate(user.role === "admin" ? "/admin" : "/client");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded-lg px-8 py-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          AutoResponder Login
        </h2>

        {message && (
          <p className="text-center mb-3 text-red-600 font-medium">
            {message}
          </p>
        )}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
