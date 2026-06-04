"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "si";

// ── Translation Dictionary ──
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    "header.brand": "Kapruka",
    "header.langSwitch": "සිං",

    // Welcome
    "welcome.title": "Ayubowan! 👋",
    "welcome.subtitle":
      "I'm your Kapruka shopping assistant. Tell me what you're looking for and I'll help you find it.",

    // Suggestions
    "suggestions.cakes": "🎂 Birthday cakes",
    "suggestions.flowers": "🌺 Flowers for Mom",
    "suggestions.gifts": "🎁 Gift hampers",
    "suggestions.chocolate": "🍫 Chocolate boxes",

    // Input
    "input.placeholder": "Message Kapruka…",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.emptyHint": "Add items from the chat to get started",
    "cart.subtotal": "Subtotal",
    "cart.checkout": "Checkout",
    "cart.close": "Close",
    "cart.remove": "Remove",
    "cart.items": "items",
    "cart.item": "item",

    // Gift Message
    "gift.title": "Gift Message",
    "gift.placeholder": "Write a personal message…",
    "gift.preview": "Preview",
    "gift.charLimit": "characters remaining",
    "gift.add": "Add Gift Message",
    "gift.edit": "Edit Message",
    "gift.save": "Save Message",
    "gift.cancel": "Cancel",
    "gift.from": "From",
    "gift.to": "To",

    // Delivery
    "delivery.title": "Delivery Date",
    "delivery.select": "Select a delivery date",
    "delivery.selected": "Delivery on",
    "delivery.unavailable": "Unavailable",
    "delivery.today": "Today",
    "delivery.tomorrow": "Tomorrow",
    "delivery.mon": "Mon",
    "delivery.tue": "Tue",
    "delivery.wed": "Wed",
    "delivery.thu": "Thu",
    "delivery.fri": "Fri",
    "delivery.sat": "Sat",
    "delivery.sun": "Sun",

    // Product
    "product.addToCart": "Add to Cart",
    "product.inCart": "In Cart",

    // General
    "general.lkr": "LKR",

    // Errors
    "error.rateLimit": "Rate limit reached — please wait a moment and try again.",
    "error.generic": "Something went wrong. Please try again.",
  },
  si: {
    // Header
    "header.brand": "කප්රුක",
    "header.langSwitch": "EN",

    // Welcome
    "welcome.title": "ආයුබෝවන්! 👋",
    "welcome.subtitle":
      "මම ඔබේ කප්රුක සාප්පු සවාරි සහායකයාමි. ඔබ සොයන දේ මට කියන්න, මම උදව් කරන්නම්.",

    // Suggestions
    "suggestions.cakes": "🎂 උපන්දින කේක්",
    "suggestions.flowers": "🌺 අම්මාට මල්",
    "suggestions.gifts": "🎁 තෑගි පැකේජ",
    "suggestions.chocolate": "🍫 චොකලට් පෙට්ටි",

    // Input
    "input.placeholder": "කප්රුකට පණිවිඩයක්…",

    // Cart
    "cart.title": "සාප්පු කරත්තය",
    "cart.empty": "ඔබේ කරත්තය හිස් ය",
    "cart.emptyHint": "ආරම්භ කිරීමට සංවාදයෙන් භාණ්ඩ එක් කරන්න",
    "cart.subtotal": "උප එකතුව",
    "cart.checkout": "මිලදී ගන්න",
    "cart.close": "වසන්න",
    "cart.remove": "ඉවත් කරන්න",
    "cart.items": "භාණ්ඩ",
    "cart.item": "භාණ්ඩය",

    // Gift Message
    "gift.title": "තෑගි පණිවිඩය",
    "gift.placeholder": "පෞද්ගලික පණිවිඩයක් ලියන්න…",
    "gift.preview": "පෙරදසුන",
    "gift.charLimit": "අකුරු ඉතිරිය",
    "gift.add": "තෑගි පණිවිඩයක් එක් කරන්න",
    "gift.edit": "පණිවිඩය සංස්කරණය",
    "gift.save": "පණිවිඩය සුරකින්න",
    "gift.cancel": "අවලංගු කරන්න",
    "gift.from": "වෙතින්",
    "gift.to": "වෙත",

    // Delivery
    "delivery.title": "බෙදා හැරීමේ දිනය",
    "delivery.select": "බෙදා හැරීමේ දිනයක් තෝරන්න",
    "delivery.selected": "බෙදා හැරීම",
    "delivery.unavailable": "ලබා ගත නොහැක",
    "delivery.today": "අද",
    "delivery.tomorrow": "හෙට",
    "delivery.mon": "සඳු",
    "delivery.tue": "අඟ",
    "delivery.wed": "බදා",
    "delivery.thu": "බ්‍රහ",
    "delivery.fri": "සිකු",
    "delivery.sat": "සෙන",
    "delivery.sun": "ඉරි",

    // Product
    "product.addToCart": "කරත්තයට එක් කරන්න",
    "product.inCart": "කරත්තයේ ඇත",

    // General
    "general.lkr": "රු.",

    // Errors
    "error.rateLimit": "ඉල්ලීම් සීමාවට ළඟා විය — මොහොතක් රැඳී නැවත උත්සාහ කරන්න.",
    "error.generic": "යම් දෝෂයක් ඇති විය. කරුණාකර නැවත උත්සාහ කරන්න.",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? translations.en[key] ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
