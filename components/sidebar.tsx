"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  CalendarDays,
  Download,
  FileText,
  Grid2x2,
  Menu,
  Pill,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Grid2x2 },
  { label: "Treatment Guidance", href: "/dashboard/guidance", icon: FileText },
  { label: "Medicine Interaction", href: "/dashboard/interactions", icon: Pill },
  { label: "Ask AI", href: "/dashboard/ask-ai", icon: Menu },
  { label: "Risk Detection", href: "/dashboard/risk", icon: Activity },
  { label: "Disease Detection", href: "/dashboard/disease", icon: Users },
  { label: "Vaccination Reminders", href: "/dashboard/reminders", icon: CalendarDays },
  { label: "Offline", href: "/offline", icon: Download },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

export function Sidebar({ className, onNavigate, user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeHref = (() => {
    if (!pathname) return null;
    const matches = navItems
      .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length);
    return matches.length > 0 ? matches[0].href : null;
  })();

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:hidden"
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 overflow-y-scroll scrollbar-none border-r border-slate-800 bg-slate-900 px-5 py-6 text-white transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="mb-6 flex items-center justify-between lg:block">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-400">
              Doctor Vai
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">Care Console</h2>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-full border border-slate-700 p-2 text-slate-300 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate?.();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl bg-slate-800 text-slate-200",
                    active && "bg-white/15 text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-xs text-slate-200">
          <p className="font-semibold text-white">Local sync: stable</p>
          <p className="mt-1 text-slate-400">Clinical guidance cached for offline use.</p>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-900"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sm font-semibold text-sky-300">
              {(user?.name ?? "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white">
                {user?.name ?? "Profile"}
              </span>
              <span className="block truncate text-xs text-slate-400">
                {user?.email ?? "View account options"}
              </span>
            </span>
          </button>

          {profileOpen ? (
            <div className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-slate-950/40">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
                  Profile
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {user?.name ?? "Signed in user"}
                </p>
                <p className="mt-1 wrap-break-word text-xs text-slate-400">
                  {user?.email ?? "No email available"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      ) : null}
    </>
  );
}
