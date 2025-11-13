import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "../layouts/AdminLayout";

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    let { data } = await supabase.from("messages").select("*");
    setMessages(data || []);
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">الرسائل المرسلة</h1>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3">العميل</th>
            <th className="p-3">الرسالة</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="p-3">{m.client_name}</td>
              <td className="p-3">{m.body}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
