"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number; // numeric LKR
  image: string;
  url: string;
  quantity: number;
  giftMessage?: string;
  deliveryDate?: string; // ISO date string
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: {
    id: string;
    name: string;
    price: string | number;
    image?: string;
    url?: string;
  }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setGiftMessage: (id: string, msg: string) => void;
  setDeliveryDate: (id: string, date: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  setGiftMessage: () => {},
  setDeliveryDate: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
  isInCart: () => false,
});

const CART_STORAGE_KEY = "kapruka-cart";

function parsePrice(price: string | number): number {
  if (typeof price === "number") return price;
  // Handle "12,500" or "12500" formats
  return parseFloat(price.replace(/,/g, "")) || 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const addToCart = useCallback(
    (product: {
      id: string;
      name: string;
      price: string | number;
      image?: string;
      url?: string;
    }) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: parsePrice(product.price),
            image: product.image || "",
            url: product.url || "",
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  }, []);

  const setGiftMessage = useCallback((id: string, msg: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, giftMessage: msg } : item
      )
    );
  }, []);

  const setDeliveryDate = useCallback((id: string, date: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, deliveryDate: date } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const isInCart = useCallback(
    (id: string) => cart.some((item) => item.id === id),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setGiftMessage,
        setDeliveryDate,
        clearCart,
        cartTotal,
        cartCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
