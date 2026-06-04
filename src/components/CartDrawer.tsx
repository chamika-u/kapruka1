"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Gift, CalendarDays, Package } from "lucide-react";
import { useCart, CartItem } from "@/lib/CartContext";
import { useI18n } from "@/lib/i18n";
import { GiftMessageEditor } from "./GiftMessageEditor";
import { DeliveryDatePicker } from "./DeliveryDatePicker";
import styles from "./CartDrawer.module.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (items: CartItem[]) => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, setGiftMessage, setDeliveryDate, cartTotal, cartCount } = useCart();
  const { t } = useI18n();
  const [giftEditId, setGiftEditId] = useState<string | null>(null);
  const [datePickId, setDatePickId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckout(cart);
    onClose();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-LK");
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Drawer panel */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className={styles.drawerTitle}>{t("cart.title")}</span>
            {cartCount > 0 && (
              <span className={styles.drawerBadge}>
                {cartCount} {cartCount === 1 ? t("cart.item") : t("cart.items")}
              </span>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label={t("cart.close")}>
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Cart Items or Empty State */}
        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={28} />
            </div>
            <p className={styles.emptyTitle}>{t("cart.empty")}</p>
            <p className={styles.emptySubtitle}>{t("cart.emptyHint")}</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                {/* Thumbnail */}
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                ) : (
                  <div className={styles.itemImagePlaceholder}>
                    <Package size={24} />
                  </div>
                )}

                {/* Item info */}
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    {t("general.lkr")} {formatPrice(item.price * item.quantity)}
                  </span>

                  {/* Badges for gift/delivery */}
                  <div className={styles.itemBadges}>
                    {item.giftMessage && (
                      <span className={`${styles.badge} ${styles.badgeGift}`}>
                        🎁 {t("gift.title")}
                      </span>
                    )}
                    {item.deliveryDate && (
                      <span className={`${styles.badge} ${styles.badgeDelivery}`}>
                        📅 {item.deliveryDate}
                      </span>
                    )}
                  </div>

                  {/* Quantity + Actions row */}
                  <div className={styles.itemActions}>
                    <div className={styles.quantityStepper}>
                      <button
                        className={styles.stepperBtn}
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                      >
                        −
                      </button>
                      <span className={styles.stepperCount}>{item.quantity}</span>
                      <button
                        className={styles.stepperBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id)}
                    >
                      {t("cart.remove")}
                    </button>
                  </div>

                  {/* Action buttons: gift / delivery */}
                  <div className={styles.itemActionsRow}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setGiftEditId(giftEditId === item.id ? null : item.id)}
                    >
                      <Gift size={12} />
                      {item.giftMessage ? t("gift.edit") : t("gift.add")}
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setDatePickId(datePickId === item.id ? null : item.id)}
                    >
                      <CalendarDays size={12} />
                      {t("delivery.select")}
                    </button>
                  </div>

                  {/* Inline Gift Message Editor */}
                  {giftEditId === item.id && (
                    <GiftMessageEditor
                      message={item.giftMessage || ""}
                      onSave={(msg) => {
                        setGiftMessage(item.id, msg);
                        setGiftEditId(null);
                      }}
                      onCancel={() => setGiftEditId(null)}
                    />
                  )}

                  {/* Inline Delivery Date Picker */}
                  {datePickId === item.id && (
                    <DeliveryDatePicker
                      selectedDate={item.deliveryDate || ""}
                      onSelect={(date) => {
                        setDeliveryDate(item.id, date);
                        setDatePickId(null);
                      }}
                      onCancel={() => setDatePickId(null)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer with checkout */}
        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>{t("cart.subtotal")}</span>
              <span className={styles.subtotalValue}>
                {t("general.lkr")} {formatPrice(cartTotal)}
              </span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              {t("cart.checkout")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
