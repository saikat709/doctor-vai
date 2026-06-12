import { defineRouting } from "next-intl/routing";

export const locales = ["en", "bn", "hi", "ur"] as const;
export type AppLocale = (typeof locales)[number];

export const localeLabels: Record<
  AppLocale,
  { shortLabel: string; nativeLabel: string; flag: string; promptLabel: string }
> = {
  en: {
    shortLabel: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    promptLabel: "English",
  },
  bn: {
    shortLabel: "বাংলা",
    nativeLabel: "বাংলা",
    flag: "🇧🇩",
    promptLabel: "Bengali (Bangla)",
  },
  hi: {
    shortLabel: "हिंदी",
    nativeLabel: "हिंदी",
    flag: "🇮🇳",
    promptLabel: "Hindi",
  },
  ur: {
    shortLabel: "اردو",
    nativeLabel: "اردو",
    flag: "🇵🇰",
    promptLabel: "Urdu",
  },
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "preferred_locale",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});

