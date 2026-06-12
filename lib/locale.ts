import { hasLocale } from "next-intl";
import { localeLabels, routing, type AppLocale } from "@/i18n/routing";

export function isAppLocale(value: string): value is AppLocale {
  return hasLocale(routing.locales, value);
}

export function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (maybeLocale && isAppLocale(maybeLocale)) {
    const nextPath = `/${segments.slice(2).join("/")}`;
    return nextPath === "/" ? "/" : nextPath.replace(/\/+$/, "") || "/";
  }

  return pathname;
}

export function getPromptLanguage(locale: string) {
  if (isAppLocale(locale)) {
    return localeLabels[locale].promptLabel;
  }

  return localeLabels.en.promptLabel;
}

