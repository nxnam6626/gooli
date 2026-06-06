"use client";

import { useState } from "react";
import { ChatCircleText, Robot } from "@phosphor-icons/react";

function AIChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Xin chào! Tôi là trợ lý AI của Gooli. Tôi có thể giúp bạn tư vấn về vật liệu xây dựng, báo giá, hoặc tìm sản phẩm phù hợp. Bạn cần hỗ trợ gì?" }
  ]);
  const [input, setInput] = useState("");

  const quickReplies = ["Báo giá sản phẩm", "Tư vấn lam gỗ", "Xem danh mục"];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "ai", text: "Cảm ơn bạn đã liên hệ! Nhân viên tư vấn sẽ phản hồi sớm nhất. Hoặc gọi ngay hotline: 0988.777.666 để được hỗ trợ nhanh nhất." }
    ]);
    setInput("");
  };

  return (
    <div className="absolute bottom-full right-0 mb-3 w-[300px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden"
      style={{ maxHeight: "420px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#B06518] to-[#7A4312]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Robot size={18} className="text-white" weight="bold" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Gooli AI</p>
            <p className="text-white/70 text-[10px] mt-0.5">Trợ lý tư vấn</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white text-lg font-bold transition-colors" aria-label="Đóng chat">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2" style={{ maxHeight: "220px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`text-xs px-3 py-2 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.from === "user"
                  ? "bg-[#B06518] text-white rounded-br-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick replies */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
        {quickReplies.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#B06518] text-[#B06518] hover:bg-[#B06518] hover:text-white transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 outline-none focus:border-[#B06518] transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          className="w-8 h-8 rounded-xl bg-[#B06518] text-white flex items-center justify-center hover:bg-[#905212] transition-colors shrink-0"
          aria-label="Gửi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function FloatingContacts() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl shadow-xl p-2.5 gap-2"
      aria-label="Liên kết liên hệ nhanh"
    >
      {/* Messenger Link */}
      <a
        href="https://m.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-white border-2 border-[#0084FF] flex items-center justify-center text-[#0084FF] hover:scale-110 active:scale-95 transition-transform shadow-sm"
        aria-label="Liên hệ qua Messenger"
      >
        <ChatCircleText size={24} weight="fill" aria-hidden="true" />
      </a>

      <div className="w-8 border-t border-neutral-100 dark:border-neutral-800" aria-hidden="true" />

      {/* Zalo Link */}
      <a
        href="https://zalo.me/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#0068FF] flex items-center justify-center text-white font-extrabold text-sm tracking-tight shadow-sm hover:scale-110 active:scale-95 transition-transform"
        aria-label="Liên hệ qua Zalo"
      >
        Zalo
      </a>

      <div className="w-8 border-t border-neutral-100 dark:border-neutral-800" aria-hidden="true" />

      {/* AI Chat Button */}
      <div className="relative">
        {isChatOpen && <AIChatWidget onClose={() => setIsChatOpen(false)} />}
        <button
          onClick={() => setIsChatOpen((v) => !v)}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B06518] to-[#7A4312] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md"
          aria-label="Chat với AI tư vấn"
        >
          <Robot size={22} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
