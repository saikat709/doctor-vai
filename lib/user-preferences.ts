import { db } from "@/lib/db";
import type { AppLocale } from "@/i18n/routing";
import { isAppLocale } from "@/lib/locale";

type SessionUserLike = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

export type UserLanguagePreferences = {
  preferredLocale: AppLocale;
  chatbotLanguage: AppLocale;
};

const defaultPreferences: UserLanguagePreferences = {
  preferredLocale: "en",
  chatbotLanguage: "en",
};

export async function getUserLanguagePreferences(
  user?: SessionUserLike | null
): Promise<UserLanguagePreferences> {
  if (!user?.email) {
    return defaultPreferences;
  }

  const record = await db.user.findUnique({
    where: { email: user.email },
    select: {
      preferredLocale: true,
      chatbotLanguage: true,
    },
  });

  return {
    preferredLocale: isAppLocale(record?.preferredLocale ?? "")
      ? (record!.preferredLocale as AppLocale)
      : "en",
    chatbotLanguage: isAppLocale(record?.chatbotLanguage ?? "")
      ? (record!.chatbotLanguage as AppLocale)
      : "en",
  };
}

export async function saveUserLanguagePreferences(
  user: SessionUserLike,
  updates: Partial<UserLanguagePreferences>
) {
  if (!user.email) {
    throw new Error("AUTH_REQUIRED");
  }

  const preferredLocale = isAppLocale(updates.preferredLocale ?? "")
    ? updates.preferredLocale
    : undefined;
  const chatbotLanguage = isAppLocale(updates.chatbotLanguage ?? "")
    ? updates.chatbotLanguage
    : undefined;

  return db.user.upsert({
    where: { email: user.email },
    update: {
      ...(preferredLocale ? { preferredLocale } : {}),
      ...(chatbotLanguage ? { chatbotLanguage } : {}),
      ...(user.name ? { name: user.name } : {}),
      ...(user.role ? { role: user.role } : {}),
    },
    create: {
      email: user.email,
      name: user.name ?? undefined,
      role: user.role ?? "HealthWorker",
      preferredLocale: preferredLocale ?? "en",
      chatbotLanguage: chatbotLanguage ?? "en",
    },
    select: {
      preferredLocale: true,
      chatbotLanguage: true,
    },
  });
}
