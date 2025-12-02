import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import AdminClientSettings from "../admin/AdminClientSettings.jsx";

export default function ClientFeatureSettings() {
  const { user } = useAuth();

  if (!user || user.role !== "client") {
    return (
      <p className="text-red-500">
        غير مصرح لك بالدخول إلى هذه الصفحة.
      </p>
    );
  }

 


// 1) جلب بيانات العميل عبر الإيميل
const { data: client, error } = await supabase
  .from("clients")
  .select("*")
  .eq("email", user.email)
  .single();

if (error || !client) {
  setError("⚠️ لا يوجد حساب عميل مرتبط بهذا المستخدم");
  return;
}

// 2) استخراج client.id للاستخدام
const clientId = client.id;
setClient(client); // إذا عندك state للعميل






  

  // نعيد استخدام نفس الصفحة لكن مع clientIdOverride
  return <AdminClientSettings clientIdOverride={user.client_id} />;
}
