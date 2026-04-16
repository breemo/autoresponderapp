import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientMessages() {
  const { user } = useAuth();
  const clientId = user?.client_id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");

  async function fetchConversations() {
    try {
      setLoadingConversations(true);
      setError("");

      const { data: stateRows, error: stateError } = await supabase
        .from("conversation_state")
        .select("*")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false });

      if (stateError) throw stateError;

      const { data: messageRows, error: messageError } = await supabase
        .from("messages")
        .select("conversation_id, message, created_at, direction, channel, sender")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (messageError) throw messageError;

      const latestMessageMap = new Map();

      for (const msg of messageRows || []) {
        if (!latestMessageMap.has(msg.conversation_id)) {
          latestMessageMap.set(msg.conversation_id, msg);
        }
      }

      const merged = (stateRows || []).map((conv) => {
        const latest = latestMessageMap.get(conv.conversation_id);

        return {
          ...conv,
          last_message: latest?.message || "",
          last_message_at: latest?.created_at || conv.updated_at,
          channel: latest?.channel || conv.platform || "",
          sender: latest?.sender || conv.sender_id || "",
          last_direction: latest?.direction || "",
        };
      });

      setConversations(merged);
    } catch (err) {
      console.error(err);
      setError("فشل في جلب المحادثات");
    } finally {
      setLoadingConversations(false);
    }
  }

  async function fetchConversationMessages(conversationId) {
    if (!conversationId) return;

    try {
      setLoadingMessages(true);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setConversationMessages(data || []);
    } catch (err) {
      console.error(err);
      setError("فشل في جلب رسائل المحادثة");
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchConversations();
    }
  }, [clientId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const matchesSearch =
        !search.trim() ||
        `${conv.sender || ""} ${conv.last_message || ""} ${conv.sender_id || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesChannel =
        channel === "all" || conv.channel === channel || conv.platform === channel;

      const matchesStatus =
        status === "all" || conv.conversation_status === status;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [conversations, search, channel, status]);

  useEffect(() => {
    if (filteredConversations.length === 0) {
      setSelectedConversationId(null);
      setConversationMessages([]);
      return;
    }

    const exists = filteredConversations.some(
      (c) => c.conversation_id === selectedConversationId
    );

    if (!exists) {
      setSelectedConversationId(filteredConversations[0].conversation_id);
    }
  }, [filteredConversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchConversationMessages(selectedConversationId);
    } else {
      setConversationMessages([]);
    }
  }, [selectedConversationId]);

  const selectedConversation =
    filteredConversations.find(
      (c) => c.conversation_id === selectedConversationId
    ) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">الرسائل</h1>
        <p className="text-gray-500">استعرض المحادثات والرسائل الخاصة بك.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white shadow rounded-xl p-4 lg:col-span-1">
          <h2 className="font-bold mb-4">المحادثات</h2>

          <div className="space-y-3 mb-4">
            <input
              className="border p-2 rounded w-full"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border p-2 rounded w-full"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="all">كل القنوات</option>
              <option value="facebook">Facebook</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            <select
              className="border p-2 rounded w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="closed">مغلقة</option>
              <option value="lead_captured">تم أخذ البيانات</option>
            </select>

            <button
              onClick={fetchConversations}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              تحديث
            </button>
          </div>

          {loadingConversations ? (
            <p className="text-gray-500 text-center">جارِ التحميل...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="text-gray-400 text-sm">لا توجد نتائج.</p>
          ) : (
            <div className="space-y-2 max-h-[650px] overflow-y-auto">
              {filteredConversations.map((conv) => {
                const isActive = conv.conversation_id === selectedConversationId;

                return (
                  <button
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversationId(conv.conversation_id)}
                    className={`w-full text-right border rounded-xl p-3 transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {conv.sender || conv.sender_id || "بدون اسم"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {conv.channel || conv.platform || "-"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 truncate mb-1">
                      {conv.last_message || "لا توجد رسالة"}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span>{conv.conversation_status || "active"}</span>
                      <span>
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleString("ar-EG")
                          : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-xl p-4 lg:col-span-2">
          {!selectedConversation ? (
            <p className="text-gray-400 text-sm">لا توجد محادثة مطابقة للبحث.</p>
          ) : (
            <>
              <div className="border-b pb-3 mb-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="font-bold">
                      {selectedConversation.sender ||
                        selectedConversation.sender_id ||
                        "بدون اسم"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.channel || selectedConversation.platform} |{" "}
                      {selectedConversation.conversation_status}
                    </p>
                  </div>

                  <div className="text-xs text-gray-400 break-all text-left">
                    {selectedConversation.conversation_id}
                  </div>
                </div>
              </div>

              {loadingMessages ? (
                <p className="text-gray-500 text-center">جارِ تحميل الرسائل...</p>
              ) : conversationMessages.length === 0 ? (
                <p className="text-gray-400 text-sm">لا توجد رسائل في هذه المحادثة.</p>
              ) : (
                <div className="space-y-3 max-h-[650px] overflow-y-auto">
                  {conversationMessages.map((msg) => {
                    const isInbound =
                      msg.direction === "inbound" || msg.direction === "in";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isInbound
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {msg.message}
                          </div>
                          <div
                            className={`mt-1 text-[11px] ${
                              isInbound ? "text-gray-500" : "text-blue-100"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleString("ar-EG")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
