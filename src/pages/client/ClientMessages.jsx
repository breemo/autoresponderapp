// src/pages/client/ClientMessages.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientMessages() {
  const { user } = useAuth();

  const [clientId, setClientId] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");

  const [selectedMessage, setSelectedMessage] = useState(null);

  // فلاتر
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState("all"); // all | whatsapp | telegram | facebook | email ...
  const [filterDirection, setFilterDirection] = useState("all"); // all | in | out
  const [filterStatus, setFilterStatus] = useState("all"); // all | unread | read

  // حماية بسيطة
  if (!user || user.role !== "client") {
    return <p className="text-red-500">غير مصرح لك بالدخول إلى هذه الصفحة.</p>;
  }

  // 1) جلب client_id الحقيقي من جدول clients عبر الإيميل
  useEffect(() => {
    async function loadClientId() {
      try {
        setLoadingClient(true);
        setError("");

        const { data: client, error: clientError } = await supabase
          .from("clients")
          .select("id, email, business_name")
          .eq("email", user.email)
          .single();

        if (clientError || !client) {
          console.error(clientError);
          setError("⚠️ لا يوجد حساب عميل مرتبط بهذا المستخدم");
          setClientId(null);
        } else {
          setClientId(client.id);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "حدث خطأ أثناء تحميل بيانات العميل");
      } finally {
        setLoadingClient(false);
      }
    }

    if (user?.email) {
      loadClientId();
    }
  }, [user]);

  // 2) دالة عامة لجلب الرسائل لهذا العميل
  async function fetchMessages(currentClientId) {
    if (!currentClientId) return;

    try {
      setLoadingMessages(true);
      setError("");

      const { data, error: msgError } = await supabase
        .from("messages")
        .select("*") // نأخذ كل الأعمدة (message, channel, sender, created_at, is_read, direction إن وجدت)
        .eq("client_id", currentClientId)
        .order("created_at", { ascending: false });

      if (msgError) throw msgError;

      setMessages(data || []);
      // لو ما في رسالة محددة، اختَر أول رسالة
      if (!selectedMessage && data && data.length > 0) {
        setSelectedMessage(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء تحميل الرسائل");
    } finally {
      setLoadingMessages(false);
    }
  }

  // 3) تحميل الرسائل عندما يتوفر clientId
  useEffect(() => {
    if (clientId) {
      fetchMessages(clientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // 4) Realtime: تحديث الرسائل عند أي تغيير على جدول messages
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`messages-client-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          // أسهل شيء: نعيد تحميل الرسائل عند أي تغيير
          fetchMessages(clientId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // 5) تطبيق الفلاتر و البحث
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // فلترة القناة
    if (filterChannel !== "all") {
      result = result.filter(
        (m) =>
          m.channel &&
          m.channel.toLowerCase() === filterChannel.toLowerCase()
      );
    }

    // فلترة الاتجاه (لو عندك عمود direction في الجدول)
    if (filterDirection !== "all") {
      result = result.filter((m) => {
        if (!("direction" in m) || !m.direction) {
          // لو ما في عمود direction نخلي الفلتر يتجاهل
          return true;
        }
        return m.direction === filterDirection;
      });
    }

    // فلترة الحالة (مقروء / غير مقروء)
    if (filterStatus === "unread") {
      result = result.filter((m) => m.is_read === false);
    } else if (filterStatus === "read") {
      result = result.filter((m) => m.is_read === true);
    }

    // البحث النصي (في النص + المرسل + القناة)
    if (search.trim() !== "") {
      const s = search.trim().toLowerCase();
      result = result.filter((m) => {
        const txt = (m.message || "").toLowerCase();
        const snd = (m.sender || "").toLowerCase();
        const ch = (m.channel || "").toLowerCase();
        return (
          txt.includes(s) ||
          snd.includes(s) ||
          ch.includes(s)
        );
      });
    }

    return result;
  }, [messages, filterChannel, filterDirection, filterStatus, search]);

  // 6) تعيين الرسالة المختارة عند تغيير الفلتر/البحث
  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      setSelectedMessage(filteredMessages[0]);
    } else if (
      selectedMessage &&
      !filteredMessages.find((m) => m.id === selectedMessage.id)
    ) {
      // لو الرسالة الحالية لا تنطبق على الفلاتر، نختار أول واحدة من الناتج
      setSelectedMessage(filteredMessages[0] || null);
    }
  }, [filteredMessages, selectedMessage]);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
  };

  const directionLabel = (m) => {
    if (!m) return "-";
    if (!("direction" in m) || !m.direction) return "-";
    return m.direction === "in" ? "واردة" : m.direction === "out" ? "صادرة" : "-";
  };

  const statusBadge = (m) => {
    if (!m) return "-";
    return m.is_read ? "مقروءة" : "غير مقروءة";
  };

  // قنوات افتراضية للفلاتر
  const channelOptions = [
    { value: "all", label: "كل القنوات" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "facebook", label: "Facebook" },
    { value: "telegram", label: "Telegram" },
    { value: "email", label: "Email" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">الرسائل</h1>
      <p className="text-gray-500 mb-4">
        هنا يمكنك استعراض كل الرسائل الواردة والصادرة لعملائك.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {loadingClient ? (
        <p>جاري تحميل بيانات العميل...</p>
      ) : !clientId ? (
        <p className="text-red-500 text-sm">
          لم يتم العثور على عميل مرتبط بهذا الحساب.
        </p>
      ) : (
        <div className="flex gap-4">
          {/* العمود الأيسر: قائمة الرسائل + الفلاتر */}
          <div className="w-full md:w-1/3 bg-white shadow rounded-xl p-4 flex flex-col">
            {/* شريط البحث */}
            <input
              type="text"
              placeholder="بحث في النص / المرسل / القناة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 mb-3 text-sm w-full"
            />

            {/* الفلاتر */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              {/* القناة */}
              <select
                className="border rounded px-2 py-1"
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
              >
                {channelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* الاتجاه */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFilterDirection("all")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterDirection === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDirection("in")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterDirection === "in"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  واردة
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDirection("out")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterDirection === "out"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  صادرة
                </button>
              </div>

              {/* الحالة */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterStatus === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("unread")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterStatus === "unread"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  غير مقروءة
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("read")}
                  className={
                    "px-2 py-1 rounded border " +
                    (filterStatus === "read"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700")
                  }
                >
                  مقروءة
                </button>
              </div>
            </div>

            {/* زر تحديث يدوي (مع وجود realtime) */}
            <button
              type="button"
              onClick={() => fetchMessages(clientId)}
              className="mb-3 text-xs bg-gray-100 hover:bg-gray-200 border rounded px-3 py-1 self-start"
              disabled={loadingMessages}
            >
              تحديث
            </button>

            {/* قائمة الرسائل */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {loadingMessages ? (
                <p className="p-3 text-sm text-gray-400">جاري تحميل الرسائل...</p>
              ) : filteredMessages.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">لا توجد رسائل مطابقة.</p>
              ) : (
                filteredMessages.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMessage(m)}
                    className={
                      "w-full text-right px-3 py-2 border-b last:border-b-0 text-sm hover:bg-gray-50 " +
                      (selectedMessage && selectedMessage.id === m.id
                        ? "bg-blue-50"
                        : "")
                    }
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold truncate max-w-[60%]">
                        {m.sender || "غير معروف"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString("ar-EG")
                          : "-"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {m.message || "-"}
                    </div>
                    <div className="mt-1 flex gap-2 text-[10px] text-gray-500">
                      <span>{m.channel || "-"}</span>
                      <span>• {directionLabel(m)}</span>
                      <span>• {m.is_read ? "مقروءة" : "غير مقروءة"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* العمود الأيمن: تفاصيل الرسالة */}
          <div className="hidden md:block w-2/3 bg-white shadow rounded-xl p-6">
            {!selectedMessage ? (
              <p className="text-gray-400 text-sm">اختر رسالة لعرضها.</p>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-1">
                    من: {selectedMessage.sender || "غير معروف"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedMessage.created_at
                      ? new Date(
                          selectedMessage.created_at
                        ).toLocaleString("ar-EG")
                      : "-"}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedMessage.message || "-"}
                  </p>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">القناة:</span>{" "}
                    {selectedMessage.channel || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">الاتجاه:</span>{" "}
                    {directionLabel(selectedMessage)}
                  </p>
                  <p>
                    <span className="font-semibold">الحالة:</span>{" "}
                    {statusBadge(selectedMessage)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
