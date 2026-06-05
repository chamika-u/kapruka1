"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { ArrowUp, ShoppingBag, Globe, AlertCircle, X, Square, User, LogOut } from "lucide-react";
import { ProductCarousel } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart, CartItem } from "@/lib/CartContext";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import styles from "./page.module.css";

// Helper to safely extract products from a tool result (parses Kapruka Markdown)
const extractProducts = (result: any) => {
  if (!result) return null;
  
  try {
    // The MCP returns an array of content parts: [{ type: "text", text: "..." }]
    let textContent = "";
    if (Array.isArray(result) && result.length > 0 && result[0].type === "text") {
      textContent = result[0].text || "";
    } else if (typeof result === "string") {
      textContent = result;
    }

    if (!textContent) return null;

    // Parse Kapruka Markdown format:
    // **1. Product Name**
    //    ID: `ID` · LKR Price · ...
    //    [View product](URL)
    const products = [];
    const productBlocks = textContent.split(/\*\*\d+\.\s/g).slice(1); // split by "**1. ", "**2. " etc

    for (const block of productBlocks) {
      const nameMatch = block.match(/^(.*?)\*\*/);
      const idMatch = block.match(/ID:\s*`([^`]+)`/);
      const priceMatch = block.match(/LKR\s*([\d,]+)/);
      const urlMatch = block.match(/\[(?:View product|Link)\]\(([^)]+)\)/);

      if (nameMatch && idMatch) {
        products.push({
          id: idMatch[1].trim(),
          name: nameMatch[1].trim(),
          price: priceMatch ? priceMatch[1].trim() : "",
          url: urlMatch ? urlMatch[1].trim() : "",
          // Use our Next.js API route to reliably scrape the og:image from the Kapruka product page
          image: urlMatch ? `/api/product-image?url=${encodeURIComponent(urlMatch[1].trim())}` : "",
        });
      }
    }

    if (products.length > 0) return products;
  } catch (e) {
    console.error("Failed to parse Kapruka markdown:", e);
  }
  return null;
};

export default function Chat() {
  const { messages, sendMessage, stop, status, error } = useChat();
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const { cartCount, cart } = useCart();
  const { t, locale, setLocale } = useI18n();
  const { user, logout } = useAuth();

  const isLoading = status === "streaming" || status === "submitted";

  // Reset dismiss when a new error appears
  useEffect(() => {
    if (error) setErrorDismissed(false);
  }, [error]);

  // Derive a user-friendly error message
  const errorMessage = error && !errorDismissed
    ? (error.message?.includes("429") || error.message?.includes("rate") || error.message?.includes("quota"))
      ? t("error.rateLimit")
      : t("error.generic")
    : null;

  const SUGGESTIONS = [
    t("suggestions.cakes"),
    t("suggestions.flowers"),
    t("suggestions.gifts"),
    t("suggestions.chocolate"),
  ];

  // Set data-locale on body for CSS font switching
  useEffect(() => {
    document.body.setAttribute("data-locale", locale);
  }, [locale]);

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

  const handleCheckout = (items: CartItem[]) => {
    // Serialize cart items and send to AI for checkout
    const itemsSummary = items.map((item) => {
      let desc = `- ${item.name} (ID: ${item.id}), Qty: ${item.quantity}, Price: LKR ${item.price}`;
      if (item.giftMessage) desc += `, Gift Message: "${item.giftMessage}"`;
      if (item.deliveryDate) desc += `, Delivery Date: ${item.deliveryDate}`;
      return desc;
    }).join("\n");

    const checkoutMsg = `Please help me checkout with these items:\n${itemsSummary}\n\nPlease create a cart and generate a guest checkout link for me.`;
    sendMessage({ text: checkoutMsg });
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "si" : "en");
  };

  return (
    <main className={styles.main}>
      {/* ── Apple-style Navigation Bar ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.langToggle} onClick={toggleLocale} aria-label="Toggle language">
            <Globe size={16} />
            <span>{t("header.langSwitch")}</span>
          </button>
        </div>
        <div className={styles.logo}>
          <ShoppingBag size={22} className={styles.logoIcon} />
          <span>{t("header.brand")}</span>
        </div>
        <div className={styles.headerRight}>
          {user ? (
            <div className={styles.userMenuContainer}>
              <button 
                className={styles.userButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className={styles.userAvatar} />
                ) : (
                  <User size={20} />
                )}
              </button>
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button 
                    className={styles.logoutBtn}
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className={styles.accountButton}
              onClick={() => setLoginOpen(true)}
              aria-label="Log in"
            >
              <User size={20} />
            </button>
          )}

          <button
            className={styles.cartButton}
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>
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
              {t("welcome.title")}
            </h1>
            <p className={styles.welcomeSubtitle}>
              {t("welcome.subtitle")}
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

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          <button
            className={styles.errorDismiss}
            onClick={() => setErrorDismissed(true)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Input Bar ── */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            value={input}
            placeholder={t("input.placeholder")}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {isLoading ? (
          <button
            type="button"
            className={`${styles.sendButton} ${styles.stopButton}`}
            onClick={stop}
            aria-label="Stop generating"
          >
            <Square size={16} strokeWidth={3} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}
      </form>

      {/* ── Cart Drawer ── */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* ── Login Modal ── */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}
