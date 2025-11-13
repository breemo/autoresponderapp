import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminLayout from "../layouts/AdminLayout";

export default function AutoReplies() {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchReplies();
  }, []);

  async function fetchReplies() {
    let { data } = await supabase.from("auto_replies").select("*");
    setReplies(data || []);
  }

  async function addReply() {
    if (!text.trim()) return;

    await supabase.from("auto_replies").insert({ text });
    setText("");
    fetchReplies();
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">الردود التلقائية</h1>

      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded w-64"
          placeholder="نص الرد"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={addReply}>
          إضافة رد
        </button>
      </div>

      <ul className="bg-white shadow rounded p-4">
        {replies.map((r) => (
          <li key={r.id} className="border-b py-2">{r.text}</li>
        ))}
      </ul>
    </AdminLayout>
  );
}
