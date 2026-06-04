"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, FormEvent } from "react";
import { ArrowUp, ShoppingBag } from "lucide-react";
import { ProductCarousel } from "@/components/ProductCard";
import styles from "./page.module.css";

// Helper to safely extract products from a tool result
const extractProducts = (result: any) => {
  if (!result) return null;
  try {
    const data = typeof result === "string" ? JSON.parse(result) : result;
    if (Array.isArray(data)) return data;
    if (data.products && Array.isArray(data.products)) return data.products;
    if (data.items && Array.isArray(data.items)) return data.items;
  } catch {
    // Not valid JSON or parsing failed
  }
  return null;
};

const SUGGESTIONS = [
  "🎂 Birthday cakes",
  "🌺 Flowers for Mom",
  "🎁 Gift hampers",
  "🍫 Chocolate boxes",
];

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  return (
    <main className={styles.main}>
      {/* ── Apple-style Navigation Bar ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <ShoppingBag size={22} className={styles.logoIcon} />
          <span>Kapruka</span>
        </div>
      </header>

      {/* ── Chat Messages ── */}
      <div className={styles.chatContainer} ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeIcon}>
              <ShoppingBag size={36} />
            </div>
            <h1 className={styles.welcomeTitle}>
              Ayubowan! 👋
            </h1>
            <p className={styles.welcomeSubtitle}>
              I&apos;m your Kapruka shopping assistant. Tell me what you&apos;re looking for and I&apos;ll help you find it.
            </p>
            <div className={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className={styles.suggestionChip}
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.messageRow} ${
              m.role === "user" ? styles.messageRowUser : styles.messageRowAgent
            }`}
          >
            {/* Render text parts */}
            {m.parts
              .filter((part) => part.type === "text" && part.text.trim().length > 0)
              .map((part, i) => (
                <div
                  key={`text-${i}`}
                  className={`${styles.messageBubble} ${
                    m.role === "user"
                      ? styles.messageBubbleUser
                      : styles.messageBubbleAgent
                  } animate-fade-in`}
                >
                  {part.type === "text" ? part.text : ""}
                </div>
              ))}

            {/* Display tool invocations (dynamic MCP tools) */}
            {m.parts
              .filter((part): part is any => part.type === "dynamic-tool" || part.type.startsWith("tool-"))
              .map((part: any) => {
                const hasResult = part.state === "output-available";
                const resultData = hasResult ? part.output : null;
                const products = hasResult ? extractProducts(resultData) : null;
                const toolName = part.toolName || part.type.replace("tool-", "");

                return (
                  <div key={part.toolCallId}>
                    <div className={styles.toolBlock}>
                      {hasResult ? "✓" : "⏳"}{" "}
                      <strong>{toolName}</strong>
                      {!hasResult && " — working…"}
                    </div>
                    {products && products.length > 0 && (
                      <ProductCarousel products={products} />
                    )}
                  </div>
                );
              })}
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.messageRow} ${styles.messageRowAgent}`}>
            <div className={`${styles.messageBubble} ${styles.messageBubbleAgent}`}>
              <div className={styles.loadingIndicator}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            value={input}
            placeholder="Message Kapruka…"
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </form>
    </main>
  );
}
