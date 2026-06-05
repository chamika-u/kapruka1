"use client";

import { CartProvider } from "@/lib/CartContext";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <CartProvider>{children}</CartProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
