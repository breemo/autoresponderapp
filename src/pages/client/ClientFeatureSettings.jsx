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

  if (!user.client_id) {
    return (
      <p className="text-red-500">
        لا يوجد عميل مرتبط بهذا المستخدم (client_id مفقود).
      </p>
    );
  }

  // نعيد استخدام نفس الصفحة لكن مع clientIdOverride
  return <AdminClientSettings clientIdOverride={user.client_id} />;
}
