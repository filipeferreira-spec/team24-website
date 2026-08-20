/* ============================================================
   TEAM 24 — Chat Widget com IA
   Widget flutuante no canto inferior direito de todas as páginas
   Assistente virtual TEAM 24 powered by LLM
   ============================================================ */

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Send, Bot, Minimize2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou o assistente virtual da TEAM 24. Posso ajudá-lo a perceber como a nossa plataforma de saúde mental pode transformar a sua empresa.\n\nComo posso ajudar?",
  timestamp: new Date(),
};

const QUICK_QUESTIONS = [
  "Como funciona a plataforma?",
  "Qual é o preço?",
  "Quanto tempo demora a implementação?",
  "Que resultados posso esperar?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + "-assistant",
        role: "assistant",
          content: typeof data.content === 'string' ? data.content : String(data.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Por favor tente novamente ou contacte-nos pelo +351 220 981 284.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || sendMessage.isPending) return;

    setShowQuickQuestions(false);
    setInput("");

    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Build history for LLM (exclude welcome message)
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    sendMessage.mutate({
      messages: [...history, { role: "user", content: messageText }],
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating button ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          aria-label="Abrir chat de apoio"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #25749F, #1B5A7D)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(37,116,159,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,116,159,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,116,159,0.4)";
          }}
          title="Chat com assistente TEAM 24"
        >
          <MessageCircle size={26} color="white" />
          {/* Notification dot */}
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#DB5C34",
            border: "2px solid white",
          }} />
        </button>
      )}

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: "360px",
            maxWidth: "calc(100vw - 2rem)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            background: "white",
            border: "1px solid #E5EEF4",
            maxHeight: isMinimized ? "auto" : "520px",
            transition: "max-height 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #25749F, #1B5A7D)",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "white", margin: 0, lineHeight: 1.2 }}>
                Assistente TEAM 24
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>Online agora</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                title={isMinimized ? "Expandir" : "Minimizar"}
                aria-label={isMinimized ? "Expandir chat" : "Minimizar chat"}
              >
                <Minimize2 size={13} color="white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                title="Fechar"
                aria-label="Fechar chat"
              >
                <X size={13} color="white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                background: "#F8FAFB",
                minHeight: "280px",
                maxHeight: "320px",
              }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                      gap: "0.5rem",
                      alignItems: "flex-end",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#25749F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: "2px" }}>
                        <Bot size={14} color="white" />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "0.65rem 0.9rem",
                        borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        background: msg.role === "user" ? "#25749F" : "white",
                        color: msg.role === "user" ? "white" : "#0A1A2A",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.85rem",
                        lineHeight: 1.55,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {sendMessage.isPending && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#25749F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={14} color="white" />
                    </div>
                    <div style={{ background: "white", borderRadius: "12px 12px 12px 2px", padding: "0.65rem 0.9rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "4px", alignItems: "center" }}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#C8D8E4",
                            display: "inline-block",
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick questions */}
                {showQuickQuestions && messages.length === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" }}>
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        style={{
                          background: "white",
                          border: "1px solid #D0E2EC",
                          borderRadius: "8px",
                          padding: "0.5rem 0.85rem",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "0.78rem",
                          color: "#25749F",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#EEF5FA"; e.currentTarget.style.borderColor = "#25749F"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#D0E2EC"; }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "0.75rem 1rem",
                borderTop: "1px solid #E5EEF4",
                background: "white",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreva a sua pergunta..."
                  disabled={sendMessage.isPending}
                  style={{
                    flex: 1,
                    background: "#F8FAFB",
                    border: "1px solid #D0E2EC",
                    borderRadius: "8px",
                    padding: "0.6rem 0.85rem",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.85rem",
                    color: "#0A1A2A",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#25749F"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#D0E2EC"; }}
                />
                <button
                  onClick={() => handleSend()}
                  aria-label="Enviar mensagem"
                  disabled={!input.trim() || sendMessage.isPending}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: input.trim() && !sendMessage.isPending ? "#DB5C34" : "#E5EEF4",
                    border: "none",
                    cursor: input.trim() && !sendMessage.isPending ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { if (input.trim() && !sendMessage.isPending) e.currentTarget.style.background = "#B84520"; }}
                  onMouseLeave={(e) => { if (input.trim() && !sendMessage.isPending) e.currentTarget.style.background = "#DB5C34"; }}
                >
                  <Send size={15} color={input.trim() && !sendMessage.isPending ? "white" : "#9CA3AF"} />
                </button>
              </div>

              {/* Footer */}
              <div style={{ padding: "0.4rem 1rem 0.6rem", textAlign: "center", background: "white" }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.65rem", color: "#C8D8E4", margin: 0 }}>
                  Assistente virtual TEAM 24 · Powered by IA
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
