"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Languages } from "lucide-react";
import { toast } from "sonner";
import { localeLabels, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

function persistPreferredLocale(nextLocale: AppLocale) {
  localStorage.setItem("preferred_locale", nextLocale);
  window.document.cookie = `preferred_locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const active = localeLabels[locale];

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    persistPreferredLocale(nextLocale);

    startTransition(() => {
      void fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLocale: nextLocale }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unable to save language preference.");
          }

          toast.success(t("updated"));
          router.replace(pathname, { locale: nextLocale });
          router.refresh();
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : "Unable to save language preference.";
          toast.error(message);
        });
    });

    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-60",
            className
          )}
          disabled={isPending}
        >
          <Languages className="h-4 w-4" />
          <span>{active.flag}</span>
          <span>{active.nativeLabel}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("interface")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(
          Object.entries(localeLabels) as Array<
            [AppLocale, (typeof localeLabels)[AppLocale]]
          >
        ).map(([value, details]) => (
          <DropdownMenuItem key={value} onSelect={() => handleChange(value)}>
            <span>{details.flag}</span>
            <span>{details.nativeLabel}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
