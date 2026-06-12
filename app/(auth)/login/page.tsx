"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("login");
  const [email, setEmail] = useState("worker@health.gov");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: `/${locale}/dashboard/session`,
    });

    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          {t("eyebrow")}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-600">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">{t("email")}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="worker@health.gov" type="email" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">{t("password")}</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123" type="password" />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>

      {/* <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-xs text-teal-800">
        <p className="font-semibold">{t("demo")}</p>
        <p className="mt-1">{t("demoDescription")}</p>
      </div> */}

      <Link href="/" className="text-xs font-semibold text-teal-700">
        {t("back")}
      </Link>
    </div>
  );
}
