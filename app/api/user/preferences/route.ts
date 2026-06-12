import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helper";
import {
  getUserLanguagePreferences,
  saveUserLanguagePreferences,
} from "@/lib/user-preferences";
import { isAppLocale } from "@/lib/locale";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getUserLanguagePreferences(session.user);
  return NextResponse.json({ success: true, preferences });
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    preferredLocale?: string;
    chatbotLanguage?: string;
  };

  const payload: { preferredLocale?: "en" | "bn" | "hi" | "ur"; chatbotLanguage?: "en" | "bn" | "hi" | "ur" } = {};

  if (body.preferredLocale) {
    if (!isAppLocale(body.preferredLocale)) {
      return NextResponse.json(
        { error: "Invalid preferredLocale" },
        { status: 400 }
      );
    }
    payload.preferredLocale = body.preferredLocale;
  }

  if (body.chatbotLanguage) {
    if (!isAppLocale(body.chatbotLanguage)) {
      return NextResponse.json(
        { error: "Invalid chatbotLanguage" },
        { status: 400 }
      );
    }
    payload.chatbotLanguage = body.chatbotLanguage;
  }

  const updated = await saveUserLanguagePreferences(session.user, payload);

  const response = NextResponse.json({ success: true, updated });
  if (payload.preferredLocale) {
    response.cookies.set("preferred_locale", payload.preferredLocale, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

