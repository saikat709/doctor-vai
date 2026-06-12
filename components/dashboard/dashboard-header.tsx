import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function DashboardHeader() {
  const t = await getTranslations("dashboardHeader");

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-600">
          {t("label")}
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">{t("title")}</h1>
      </div>
      <LanguageSwitcher />
    </header>
  );
}

