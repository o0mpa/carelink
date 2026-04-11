import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

export function meta() {
    return [{ title: "Messages - CareLink" }];
}

export default function ChatInterface() {
  // Database-Ready State
    const [messages, setMessages] = useState<{id: number, text: string, sender: string, timestamp: string}[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
    scrollToBottom();
    }, [messages]);

  /* // BACKEND PARTNER: Uncomment this block to enable real-time Socket.io 
    useEffect(() => {
    import("socket.io-client").then(({ io }) => {
      const socket = io("http://localhost:3000"); // Backend URL
        
        socket.on("receive-message", (incomingMessage) => {
        setMessages((prev) => [...prev, incomingMessage]);
        });

        return () => socket.disconnect();
    });
    }, []);
  */

  // Message Submission 
    const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = {
        id: Date.now(),
        text: newMessage,
      sender: "client", // Backend will replace this with real session data
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, messagePayload]);
    setNewMessage("");

    // BACKEND PARTNER: Add your emit function here
    // socket.emit("send-message", messagePayload);
    };

    return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans antialiased">
        
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between bg-white/90 px-6 py-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-5">
            <Link 
            to="/dashboard/client" 
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-teal-50 hover:ring-2 hover:ring-teal-100"
            aria-label="Go back"
            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-500 transition-colors group-hover:text-teal-600">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            </Link>
            
            <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700 ring-2 ring-white shadow-sm">
                CG
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Your Caregiver</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                </span>
                <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Active Now</p>
                </div>
            </div>
            </div>
        </div>
        </header>

      {/* MESSAGE AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
            
            {messages.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center text-center">
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-teal-600">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <p className="text-lg font-bold text-slate-900">Start the conversation</p>
                <p className="mt-2 text-sm font-medium text-slate-500 max-w-xs">Coordinate care details, schedules, and questions directly here.</p>
                </div>
            </div>
            ) : (
            <div className="mb-8 flex justify-center">
                <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm ring-1 ring-slate-200">
                Today
                </span>
            </div>
            )}

          {/* Render Messages */}
            {messages.map((msg, index) => {
            const isMe = msg.sender === "client"; 
            const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== msg.sender);
            
            return (
                <div key={msg.id} className={`flex w-full gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                
                {!isMe && (
                    <div className="flex flex-col justify-end pb-6">
                    {showAvatar ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700 shadow-sm ring-2 ring-white">
                        CG
                        </div>
                    ) : (
                        <div className="w-9 shrink-0" /> 
                    )}
                    </div>
                )}
 
                <div className={`flex max-w-[80%] flex-col gap-1.5 sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                
                    <div 
                    className={`px-6 py-4 shadow-sm ${
                        isMe 
                        ? "rounded-3xl rounded-br-md bg-teal-600 text-white shadow-teal-600/20" 
                        : "rounded-3xl rounded-bl-md bg-white text-slate-900 ring-1 ring-slate-200/50"
                    }`}
                    >
                    <p className="text-base font-medium leading-relaxed">{msg.text}</p>
                    </div>
                    
                   {/* Timestamp */}
                    <span className={`px-2 text-xs font-semibold text-slate-400 ${isMe ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                    </span>
                </div>
                </div>
            );
            })}
            
            <div ref={messagesEndRef} className="h-2" />
        </div>
        </main>

        <footer className="shrink-0 bg-transparent px-4 pb-6 pt-2 sm:px-6">
        <div className="mx-auto max-w-3xl">
            <form 
            onSubmit={handleSendMessage} 
            className="flex items-center gap-2 rounded-full bg-white p-2.5 shadow-lg ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:shadow-teal-500/10 transition-all duration-300"
            >
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="w-full bg-transparent px-5 py-2.5 text-base font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
                autoComplete="off"
            />
            <button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-md transition-all hover:bg-teal-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-teal-600 disabled:hover:scale-100"
                aria-label="Send message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 ml-1">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
            </button>
            </form>
        </div>
        </footer>

    </div>
    );
}