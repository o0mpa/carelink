import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import axiosInstance from "~/utils/axiosinstance";
import { API_BASE_URL } from "~/utils/api";
import { getRole } from "~/utils/auth";

export function meta() {
  return [
    { title: "Chat - CareLink" },
    { name: "description", content: "Real-time messaging with your care partner." },
  ];
}

export function loader() {
  return null;
}

type Message = {
  id: string;
  senderId: number;
  receiverId: number;
  message: string;
  timestamp: number;
};

type ChatHistoryRow = {
  message_id: number;
  sender_user_id: number;
  receiver_user_id: number;
  message: string;
  created_at: string;
};

const formatTime = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));

/** Socket.IO attaches to the HTTP server root (no `/api` path). */
const getSocketUrl = () => API_BASE_URL.replace(/\/api\/?$/i, "");

export default function ChatUI() {
  const { requestId: requestIdParam } = useParams();
  const navigate = useNavigate();
  const requestId = requestIdParam ?? "";
  const numericRequestId = Number(requestId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resolveOtherUserIdFallback = useCallback(
    async (role: string | null): Promise<number | null> => {
      try {
        if (role === "Client") {
          const { data } = await axiosInstance.get<{
            requests?: { request_id?: number; caregiver_user_id?: number | null };
          }>("/requests/clients/current-request");
          const req = data?.requests;
          if (req?.request_id === numericRequestId && req?.caregiver_user_id != null) {
            return req.caregiver_user_id;
          }
          return null;
        }

        if (role === "Caregiver") {
          const { data } = await axiosInstance.get<{
            request?: { request_id?: number; client_user_id?: number | null };
          }>("/requests/caregivers/current-request");
          const req = data?.request;
          if (req?.request_id === numericRequestId && req?.client_user_id != null) {
            return req.client_user_id;
          }
          return null;
        }
      } catch {
        return null;
      }
      return null;
    },
    [numericRequestId],
  );

  const goToDashboard = useCallback(() => {
    const role = getRole();
    if (role === "Caregiver") navigate("/dashboard/caregiver");
    else navigate("/dashboard/client");
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!requestId || !Number.isFinite(numericRequestId) || numericRequestId <= 0) {
      setError("Invalid request ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const initializeChat = async () => {
      try {
        const { data: authData } = await axiosInstance.get<{ user?: { id?: number } }>(
          "/auth/verify",
        );
        const me = authData?.user?.id;
        if (me == null) {
          throw new Error("Could not resolve your account. Please sign in again.");
        }
        if (cancelled) return;
        setMyUserId(me);

        const role = getRole();
        let other: number | null = null;
        try {
          const { data: accessData } = await axiosInstance.get<{
            otherUserId?: number;
            allowed?: boolean;
          }>(`/requests/${numericRequestId}/chat-access`);
          other = accessData?.otherUserId ?? null;
        } catch {
          // Fallback for backend variants where chat-access is temporarily unavailable.
          other = await resolveOtherUserIdFallback(role);
        }

        if (other == null) throw new Error("Could not resolve the other participant for this request.");
        if (cancelled) return;
        setOtherUserId(other);

        try {
          const { data: hist } = await axiosInstance.get<{
            messages?: ChatHistoryRow[];
          }>(`/requests/${numericRequestId}/messages`);
          if (!cancelled) {
            const rows = hist?.messages ?? [];
            setMessages(
              rows.map((m) => ({
                id: String(m.message_id),
                senderId: m.sender_user_id,
                receiverId: m.receiver_user_id,
                message: m.message,
                timestamp: new Date(m.created_at).getTime(),
              })),
            );
          }
        } catch {
          if (!cancelled) setMessages([]);
        }

        const socketUrl = getSocketUrl();
        const socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("register", me);
        });

        socket.on("receiveMessage", (data: {
          senderId: number;
          receiverId: number;
          message: string;
        }) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              senderId: data.senderId,
              receiverId: data.receiverId,
              message: data.message,
              timestamp: Date.now(),
            },
          ]);
        });

        if (!cancelled) setLoading(false);
      } catch (err: unknown) {
        const ax = err as { response?: { status?: number; data?: { message?: string } } };
        if (ax.response?.status === 401) {
          navigate("/login");
          return;
        }
        const errMsg =
          ax.response?.data?.message ||
          (err instanceof Error ? err.message : "Failed to initialize chat.");
        if (!cancelled) {
          setError(errMsg);
          setLoading(false);
        }
      }
    };

    void initializeChat();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [requestId, numericRequestId, navigate, resolveOtherUserIdFallback]);

  const sendMessage = useCallback(() => {
    if (
      !newMessage.trim() ||
      !socketRef.current ||
      !myUserId ||
      !otherUserId ||
      !Number.isFinite(numericRequestId)
    ) {
      return;
    }

    const messageData = {
      senderId: myUserId,
      receiverId: otherUserId,
      message: newMessage.trim(),
      requestId: numericRequestId,
    };

    socketRef.current.emit("sendMessage", messageData);

    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
      },
    ]);
    setNewMessage("");
  }, [newMessage, myUserId, otherUserId, numericRequestId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="animate-pulse text-sm font-semibold text-slate-500">
            Connecting to chat...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-red-100">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">Can’t open chat</h2>
          <p className="mb-8 text-sm font-medium text-slate-500">{error}</p>
          <button
            type="button"
            onClick={goToDashboard}
            className="w-full rounded-xl bg-slate-800 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          >
            <span className="text-xl font-bold">←</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-blue-500 font-bold text-white shadow-sm shadow-emerald-500/20">
              C
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-800">Care partner</h1>
              <p className="text-xs font-semibold text-emerald-600">
                Request #{requestId}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 scroll-smooth overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
          {messages.length === 0 && (
            <div className="mt-20 flex flex-col items-center justify-center text-center duration-500 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-500 shadow-inner ring-1 ring-blue-100">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">No messages yet</h3>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Say hello and coordinate the details of your service.
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div className="my-2 flex justify-center">
              <span className="rounded-full bg-slate-200/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 backdrop-blur-sm">
                Today
              </span>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId === myUserId;
            const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex w-full duration-300 animate-in fade-in slide-in-from-bottom-2 ${isMe ? "justify-end" : "justify-start"} ${isConsecutive ? "-mt-4" : ""}`}
              >
                <div
                  className={`flex max-w-[80%] flex-col sm:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative px-5 py-3 text-sm shadow-sm ${
                      isMe
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200/60 bg-white text-slate-800 shadow-slate-200/20"
                    } ${
                      isMe
                        ? isConsecutive
                          ? "rounded-2xl rounded-tr-sm"
                          : "rounded-2xl rounded-br-sm"
                        : isConsecutive
                          ? "rounded-2xl rounded-tl-sm"
                          : "rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    <p className="wrap-break-word whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium text-slate-400 ${isMe ? "pr-1" : "pl-1"}`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-slate-300 bg-white/95 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="max-h-30 min-h-13 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
              title="Send message"
            >
              <svg className="ml-0.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] font-medium text-slate-400">
              Press{" "}
              <kbd className="rounded bg-slate-100 px-1 py-0.5 font-sans">Enter</kbd> to send ·{" "}
              <kbd className="rounded bg-slate-100 px-1 py-0.5 font-sans">Shift+Enter</kbd> for a new line
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
