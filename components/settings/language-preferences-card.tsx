"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { localeLabels, type AppLocale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguagePreferencesCardProps = {
  initialPreferredLocale?: AppLocale;
  initialChatbotLanguage?: AppLocale;
};

function persistPreferredLocale(nextLocale: AppLocale) {
  localStorage.setItem("preferred_locale", nextLocale);
  window.document.cookie = `preferred_locale=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LanguagePreferencesCard({
  initialPreferredLocale,
  initialChatbotLanguage,
}: LanguagePreferencesCardProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");
  const [preferredLocale, setPreferredLocale] = useState<AppLocale>(
    initialPreferredLocale ?? locale
  );
  const [chatbotLanguage, setChatbotLanguage] = useState<AppLocale>(
    initialChatbotLanguage ?? locale
  );
  const [savingChatbot, setSavingChatbot] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/user/preferences", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as {
          preferences?: {
            preferredLocale?: AppLocale;
            chatbotLanguage?: AppLocale;
          };
        };
      })
      .then((data) => {
        if (cancelled || !data?.preferences) {
          return;
        }

        if (data.preferences.preferredLocale) {
          setPreferredLocale(data.preferences.preferredLocale);
        }

        if (data.preferences.chatbotLanguage) {
          setChatbotLanguage(data.preferences.chatbotLanguage);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const switchInterfaceLanguage = async (nextLocale: AppLocale) => {
    setPreferredLocale(nextLocale);
    persistPreferredLocale(nextLocale);

    const response = await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredLocale: nextLocale }),
    });

    if (!response.ok) {
      throw new Error("Unable to update interface language.");
    }

    toast.success(t("updated"));
    router.replace(pathname, { locale: nextLocale });
    router.refresh();
  };

  const saveChatbotLanguage = async () => {
    setSavingChatbot(true);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatbotLanguage }),
      });

      if (!response.ok) {
        throw new Error("Unable to update AI response language.");
      }

      toast.success(t("updated"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update AI response language.";
      toast.error(message);
    } finally {
      setSavingChatbot(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
        <p className="text-sm text-slate-600">
          Set the dashboard interface language and the language used in AI responses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("interface")}</span>
          <Select
            value={preferredLocale}
            onValueChange={(value) => {
              void switchInterfaceLanguage(value as AppLocale).catch((error: unknown) => {
                const message =
                  error instanceof Error ? error.message : "Unable to update interface language.";
                toast.error(message);
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(localeLabels) as Array<
                  [AppLocale, (typeof localeLabels)[AppLocale]]
                >
              ).map(([value, details]) => (
                <SelectItem key={value} value={value}>
                  {details.flag} {details.nativeLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t("ai")}</span>
          <Select
            value={chatbotLanguage}
            onValueChange={(value) => setChatbotLanguage(value as AppLocale)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(localeLabels) as Array<
                  [AppLocale, (typeof localeLabels)[AppLocale]]
                >
              ).map(([value, details]) => (
                <SelectItem key={value} value={value}>
                  {details.flag} {details.nativeLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="mt-4">
        <Button onClick={() => void saveChatbotLanguage()} disabled={savingChatbot}>
          {savingChatbot ? "Saving..." : t("saveAi")}
        </Button>
      </div>
    </section>
  );
}
