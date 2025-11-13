import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AutoReplies() {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState({ trigger: "", response: "" });

  const fetchReplies = async () => {
    const { data, error } = await supabase.from("auto_replies").select("*");
    if (!error) setReplies(data);
  };

  const addReply = async () => {
    if (!newReply.trigger || !newReply.response) return alert("املأ الحقول أولاً");
    await supabase.from("auto_replies").insert([newReply]);
    setNewReply({ trigger: "", response: "" });
    fetchReplies();
  };

  const deleteReply = async (id) => {
    await supabase.from("auto_replies").delete().eq("id", id);
    fetchReplies();
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        🤖 إدارة الردود التلقائية
      </h2>

      <div className="mb-6 bg-white shadow-md rounded-xl p-4">
        <input
          type="text"
          placeholder="الكلمة المحفزة"
          className="border rounded px-3 py-2 mr-2"
          value={newReply.trigger}
          onChange={(e) => setNewReply({ ...newReply, trigger: e.target.value })}
        />
        <input
          type="text"
          placeholder="الرد التلقائي"
          className="border rounded px-3 py-2 mr-2"
          value={newReply.response}
          onChange={(e) =>
            setNewReply({ ...newReply, response: e.target.value })
          }
        />
        <button
          onClick={addReply}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          إضافة
        </button>
      </div>

      <table className="w-full bg-white shadow-md rounded-xl overflow-hidden">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="py-3 px-4">الكلمة المحفزة</th>
            <th className="py-3 px-4">الرد</th>
            <th className="py-3 px-4">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {replies.map((r) => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{r.trigger}</td>
              <td className="py-3 px-4">{r.response}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => deleteReply(r.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
