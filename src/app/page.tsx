"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Send, ShoppingBag } from "lucide-react";
import styles from "./page.module.css";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <ShoppingBag size={28} />
          <span>Kapruka AI</span>
        </div>
      </header>

      <div className={styles.chatContainer} ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className={`${styles.messageRow} ${styles.messageRowAgent}`}>
            <div className={`${styles.messageBubble} ${styles.messageBubbleAgent} animate-fade-in`}>
              Ayubowan! 👋 I'm your Kapruka AI Shopping Assistant. 
              How can I help you find the perfect gift today?
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
            <div
              className={`${styles.messageBubble} ${
                m.role === "user"
                  ? styles.messageBubbleUser
                  : styles.messageBubbleAgent
              } animate-fade-in`}
            >
              {m.content}
            </div>
            
            {/* Display tool invocations if any */}
            {m.toolInvocations?.map((toolInvocation) => (
              <div key={toolInvocation.toolCallId} className={styles.toolBlock}>
                Calling tool: <strong>{toolInvocation.toolName}</strong>...
                {toolInvocation.state === 'result' && (
                  <div>
                    ✓ Done
                  </div>
                )}
              </div>
            ))}
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

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          className={styles.inputField}
          value={input}
          placeholder="Ask me to find products, e.g., 'Show me some cakes'..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading || !input.trim()}>
          <Send size={20} />
        </button>
      </form>
    </main>
  );
}
