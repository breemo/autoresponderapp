import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";

export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader text="تحميل الصفحة..." />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-gray-600">This is your client dashboard.</p>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Logout
      </button>
    </div>
  );
}
