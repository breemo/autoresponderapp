import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [search, setSearch] = useState("");

  // جلب client_id
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    async function loadClient() {
      const { data, error } = await supabase
        .from("clients")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!error && data) {
        setClientId(data.id);
      }
    }
    loadClient();
  }, [user]);

  useEffect(() => {
    if (clientId) fetchMessages();
  }, [clientId]);

  async function fetchMessages() {
    setLoading(true);

    let query = supabase
      .from("messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.ilike("message", `%${search}%`);
    }

    const { data, error } = await query;

    if (!error) setMessages(data);
    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", id);

    fetchMessages();
  }

  if (loading) return <p>جاري تحميل الرسائل...</p>;

  return (
    <div className="flex gap-4">
      {/* قائمة الرسائل */}
      <div className="w-1/3 bg-white shadow rounded p-4">
        <input
          type="text"
          placeholder="بحث..."
          className="border px-3 py-2 w-full mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && fetchMessages()}
        />

        {messages.length === 0 ? (
          <p className="text-gray-400">لا توجد رسائل.</p>
        ) : (
          <ul>
            {messages.map((msg) => (
              <li
                key={msg.id}
                onClick={() => {
                  setSelectedMsg(msg);
                  if (!msg.is_read) markAsRead(msg.id);
                }}
                className={`p-3 border-b cursor-pointer ${
                  msg.is_read ? "" : "bg-blue-50"
                }`}
              >
                <div className="font-bold">{msg.sender || "مجهول"}</div>
                <div className="text-sm text-gray-600">
                  {msg.message.slice(0, 40)}...
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* الرسالة المختارة */}
      <div className="flex-1 bg-white shadow rounded p-4">
        {selectedMsg ? (
          <>
            <h2 className="text-xl font-bold mb-2">
              من: {selectedMsg.sender}
            </h2>
            <p className="mb-4 text-gray-600">
              {new Date(selectedMsg.created_at).toLocaleString()}
            </p>
            <p className="text-lg">{selectedMsg.message}</p>
          </>
        ) : (
          <p className="text-gray-400">اختر رسالة لعرضها.</p>
        )}
      </div>
    </div>
  );
}
