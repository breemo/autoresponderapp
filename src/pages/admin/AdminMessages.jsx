import AdminLayout from "../../layouts/AdminLayout";

export default function AdminMessages() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">الرسائل المرسلة</h1>
      <p className="text-gray-500">جميع الرسائل التي تم إرسالها.</p>
    </AdminLayout>
  );
}
