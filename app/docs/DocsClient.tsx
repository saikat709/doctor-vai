"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Lock,
  Unlock,
  Settings,
  Edit3,
  Save,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash,
  Download,
  Printer,
  Search,
  Share2,
  Activity,
  Database,
  Users,
  Award,
  Clock,
  Shield,
  Play,
  CheckCircle,
  FileText,
  AlertCircle,
  X,
  History,
  Info
} from "lucide-react";
import { DocsConfig, DocSection, TeamMember } from "@/lib/docs-default";
import { LiveEvent } from "@/app/api/docs/stats/route";

interface DocsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export default function DocsClient({ user }: DocsClientProps) {
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [bypass, setBypass] = useState(false);

  // App configurations state
  const [config, setConfig] = useState<DocsConfig | null>(null);
  const [sections, setSections] = useState<DocSection[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  // Live Sync Stats state
  const [stats, setStats] = useState({
    patients: 0,
    sessions: 0,
    reminders: 0,
    knowledgeDocs: 0,
    chunks: 0,
    users: 0,
    aiDiagnostics: 0,
  });
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [refreshStatsCount, setRefreshStatsCount] = useState(0);

  // Navigation and layout state
  const [activeTab, setActiveTab] = useState<"pitch" | "tech">("pitch");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("");

  // Admin Controls & Editing state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingSection, setEditingSection] = useState<DocSection | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingSection, setSavingSection] = useState(false);

  // Team editing state
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState<TeamMember[]>([]);

  // Version History states (simple in-memory log for the current session)
  const [versionHistory, setVersionHistory] = useState<{ [key: string]: string[] }>({});

  // Countdown timer calculations
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const isAdmin = user && user.role && ["Admin", "SuperAdmin"].includes(user.role);

  // 1. Fetch Docs Settings & Content
  const fetchDocsData = async () => {
    try {
      const res = await fetch("/api/docs/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setSections(data.sections.sort((a: DocSection, b: DocSection) => a.order - b.order));
        setTeam(data.team);
        setIsPublic(data.isPubliclyAccessible);
        setBypass(data.bypass);
      }
    } catch (err) {
      console.error("Failed to load docs configuration", err);
    }
  };

  // 2. Fetch Real-time System Statistics
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/docs/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDocsData();
      await fetchStats();
      setLoading(false);
    };
    init();
  }, [user]);

  // Periodic statistics polling every 10 seconds for the "live integration" feel
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 3. Locked countdown clock timer calculations
  useEffect(() => {
    if (!config) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(config.startDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  // Handle saving of access control parameters
  const saveAccessConfig = async (newConfig: DocsConfig) => {
    try {
      const res = await fetch("/api/docs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "config", data: newConfig }),
      });
      if (res.ok) {
        setConfig(newConfig);
        setIsPublic(newConfig.overrideActive ? newConfig.overridePublicValue : (new Date() >= new Date(newConfig.startDate) && new Date() <= new Date(newConfig.endDate)));
        alert("Availability configuration saved successfully!");
      } else {
        alert("Failed to save configuration.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle saving modified section markdown content
  const saveSection = async () => {
    if (!editingSection || !config) return;
    setSavingSection(true);

    const updatedSections = sections.map((s) => {
      if (s.id === editingSection.id) {
        // Track history of edits before overwriting
        const historyList = versionHistory[s.id] || [];
        if (!historyList.includes(s.content)) {
          setVersionHistory({
            ...versionHistory,
            [s.id]: [...historyList, s.content],
          });
        }
        return { ...s, title: editTitle, content: editContent };
      }
      return s;
    });

    try {
      const res = await fetch("/api/docs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sections", data: updatedSections }),
      });
      if (res.ok) {
        setSections(updatedSections);
        setEditingSection(null);
      } else {
        alert("Failed to update section.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(false);
    }
  };

  // Revert/restore previous content version from session history
  const restorePreviousVersion = (sectionId: string, content: string) => {
    setEditContent(content);
  };

  // Reorder sections (Move Up / Down)
  const reorderSection = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    // Swap positions
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    // Recalculate orders
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));

    try {
      const res = await fetch("/api/docs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sections", data: updated }),
      });
      if (res.ok) {
        setSections(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Team profile updates
  const saveTeam = async (updatedTeam: TeamMember[]) => {
    try {
      const res = await fetch("/api/docs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "team", data: updatedTeam }),
      });
      if (res.ok) {
        setTeam(updatedTeam);
        setEditingTeam(false);
        alert("Team registry updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export entire documentation set as combined Markdown
  const exportAsMarkdown = () => {
    let mdContent = `# Doctor Vai — Live Documentation & Pitch System\n\n`;
    mdContent += `*Generated dynamically from System State on: ${new Date().toLocaleString()}*\n\n`;
    mdContent += `## Access Status: ${isPublic ? "Publicly Accessible Showcase" : "Restricted Showcase"}\n\n`;

    mdContent += `## --- PART 1: Y COMBINATOR PITCH DECK ---\n\n`;
    sections
      .filter((s) => s.category === "pitch")
      .forEach((s) => {
        mdContent += `### ${s.title}\n\n${s.content}\n\n---\n\n`;
      });

    mdContent += `\n## --- PART 2: CLINICAL TECHNICAL WHITEPAPER ---\n\n`;
    sections
      .filter((s) => s.category === "tech")
      .forEach((s) => {
        mdContent += `### ${s.title}\n\n${s.content}\n\n---\n\n`;
      });

    mdContent += `\n## Team Contributors\n\n`;
    team.forEach((m) => {
      mdContent += `- **${m.name}** - ${m.role} (${m.email})\n`;
    });

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "doctor_vai_docs.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy shareable link
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Documentation URL copied to clipboard!");
  };

  // Filter sections based on active category (pitch/tech) and search queries
  const filteredSections = sections.filter((s) => {
    const matchesCategory = s.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Skeleton Loader screen
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-sm font-semibold tracking-wider uppercase text-teal-400 animate-pulse">
            Connecting to Doctor Vai databases...
          </p>
        </div>
      </div>
    );
  }

  // A. RENDER LOCKED PORTAL WITH GLOWING COUNTDOWN TIMER IF NOT PUBLIC & NOT BYPASSED
  if (!isPublic && !bypass && config) {
    return (
      <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        {/* Radial Background Decorative Lights */}
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-sky-500/10 blur-[120px]"></div>

        {/* Top bar logo */}
        <header className="mx-auto flex w-full max-w-4xl justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/20 border border-teal-500/40 px-3 py-2 text-xl font-bold text-teal-400">
              DV
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-400">
                Resilient Companion
              </p>
              <h1 className="text-lg font-bold text-slate-100">Doctor Vai</h1>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-teal-500/30 bg-teal-950/40 px-4 py-2 text-xs font-semibold text-teal-300 transition hover:bg-teal-900/60"
          >
            Clinical Login
          </Link>
        </header>

        {/* Central Lock Portal Content */}
        <section className="mx-auto my-auto flex w-full max-w-xl flex-col items-center text-center z-10 py-12">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(20,184,166,0.1)]">
            <Lock className="h-10 w-10 text-teal-400 animate-pulse" />
            <div className="absolute -inset-1 rounded-3xl border border-teal-500/30 animate-ping opacity-30 pointer-events-none"></div>
          </div>

          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
              Scheduled Judging Showcase
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              System Portfolio Restricted
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              Our comprehensive YC Pitch Deck, full technology whitepapers, and live database insights are scheduled to be made public on:
              <span className="block mt-2 font-semibold text-slate-200">
                June 10, 2026 (00:00 UTC) ➔ June 14, 2026 (23:59 UTC)
              </span>
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="mt-8 grid grid-cols-4 gap-3 w-full max-w-sm">
            {[
              { label: "Days", val: timeRemaining.days },
              { label: "Hours", val: timeRemaining.hours },
              { label: "Mins", val: timeRemaining.minutes },
              { label: "Secs", val: timeRemaining.seconds },
            ].map((t) => (
              <div
                key={t.label}
                className="flex flex-col items-center rounded-2xl bg-slate-900/80 border border-slate-800 p-3 shadow-md"
              >
                <span className="font-mono text-3xl font-bold tracking-tight text-teal-400">
                  {String(t.val).padStart(2, "0")}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  {t.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-4 text-xs text-slate-400 max-w-sm">
            <AlertCircle className="h-4 w-4 text-teal-500 inline mr-1 mb-0.5" />
            Judging panels, staff, or advisors with credentialed accounts may sign in bypass this restriction.
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto w-full max-w-4xl text-center text-xs text-slate-600 z-10">
          <p>© {new Date().getFullYear()} Doctor Vai Platform. Built for resilient community healthcare.</p>
        </footer>
      </main>
    );
  }

  // B. RENDER COMPREHENSIVE DOCUMENTATION & ADMIN showcase VIEW
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none"></div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-850 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-xl bg-teal-500/10 border border-teal-500/30 px-3 py-2 text-xl font-bold text-teal-400 transition hover:bg-teal-500/20">
              DV
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-400">
                Resilient Companion
              </p>
              <h1 className="text-sm font-semibold text-slate-100">Doctor Vai Docs</h1>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync Enabled
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-teal-300 font-semibold cursor-pointer hover:bg-teal-500/20 transition"
              >
                <Settings className="h-3 w-3 animate-spin-slow" />
                {showAdminPanel ? "Hide Admin Panel" : "Admin Panel"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAsMarkdown}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold hover:bg-slate-850 hover:text-white transition"
              title="Export as Markdown file"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export MD</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold hover:bg-slate-850 hover:text-white transition"
              title="Print / Save as PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            {user ? (
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-300"
                >
                  Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition shadow-[0_10px_20px_rgba(13,148,136,0.15)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* PRINT-ONLY HEADER FOR CLEAN EXPORTS */}
      <div className="hidden print:block text-slate-900 p-8 border-b-2 border-slate-300 mb-8">
        <h1 className="text-4xl font-extrabold">DOCTOR VAI</h1>
        <p className="text-md text-slate-600 mt-2 font-semibold">Resilient, Local-First Clinical Decision Support Companion</p>
        <p className="text-xs text-slate-500 mt-1">Official Project Pitch Deck & Technical Documentation — Compiled Live</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:p-0">

        {/* C. ADMIN CONTROLS INTERACTIVE PANEL */}
        {isAdmin && showAdminPanel && config && (
          <section className="mb-8 rounded-3xl border border-teal-500/30 bg-teal-950/20 p-6 shadow-2xl backdrop-blur relative animate-fade-in print:hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="rounded-full hover:bg-teal-900/40 p-1.5 text-teal-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-teal-400" />
              <h3 className="text-lg font-bold text-slate-100">Admin Control Center</h3>
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                {user?.email} ({user?.role})
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Access Control Sliders */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Visibility Access
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Instant Visibility override</p>
                      <p className="text-[10px] text-slate-400">Ignore date filters and force public visibility state</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = { ...config, overrideActive: !config.overrideActive };
                        saveAccessConfig(updated);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.overrideActive ? "bg-teal-500" : "bg-slate-800"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition ${config.overrideActive ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>

                  {config.overrideActive && (
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Force Visible Publicly</p>
                        <p className="text-[10px] text-slate-400">If ON, document is open; If OFF, document is closed</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = { ...config, overridePublicValue: !config.overridePublicValue };
                          saveAccessConfig(updated);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.overridePublicValue ? "bg-emerald-500" : "bg-slate-800"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition ${config.overridePublicValue ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Schedule Active Window</p>
                      <p className="text-[10px] text-slate-400">Enables publishing strictly in date-window</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = { ...config, publicAccess: !config.publicAccess };
                        saveAccessConfig(updated);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${config.publicAccess ? "bg-teal-500" : "bg-slate-800"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition ${config.publicAccess ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Date Scheduler inputs */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Availability Scheduler
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Start Availability</label>
                    <input
                      type="datetime-local"
                      value={config.startDate.slice(0, 16)}
                      onChange={(e) => {
                        const updated = { ...config, startDate: new Date(e.target.value).toISOString() };
                        setConfig(updated);
                      }}
                      className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">End Availability</label>
                    <input
                      type="datetime-local"
                      value={config.endDate.slice(0, 16)}
                      onChange={(e) => {
                        const updated = { ...config, endDate: new Date(e.target.value).toISOString() };
                        setConfig(updated);
                      }}
                      className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => saveAccessConfig(config)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer"
                  >
                    Save Show Windows
                  </button>
                </div>
              </div>

              {/* Dynamic Quick Presets */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-2">
                    <Info className="h-3.5 w-3.5" />
                    Quick Presets
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-3">
                    Automatically override the scheduled filters to instantly unlock or default to evaluation presets.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        overrideActive: true,
                        overridePublicValue: true,
                      };
                      saveAccessConfig(updated);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 py-2 px-1 text-center font-semibold rounded-lg text-[10px] transition cursor-pointer text-emerald-400"
                  >
                    ● Force Live Open
                  </button>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        overrideActive: true,
                        overridePublicValue: false,
                      };
                      saveAccessConfig(updated);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 py-2 px-1 text-center font-semibold rounded-lg text-[10px] transition cursor-pointer text-rose-400"
                  >
                    ■ Force Locked
                  </button>
                  <button
                    onClick={() => {
                      const updated = {
                        ...config,
                        overrideActive: false,
                        startDate: "2026-06-10T00:00:00.000Z",
                        endDate: "2026-06-14T23:59:59.000Z",
                        publicAccess: true,
                      };
                      saveAccessConfig(updated);
                    }}
                    className="col-span-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 py-1.5 text-center font-medium rounded-lg text-[10px] transition cursor-pointer text-slate-300"
                  >
                    Reset to Default June 10-14 Window
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HERO HEADER */}
        <section className="mb-10 text-center md:text-left md:flex justify-between items-end print:hidden">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-400">
              Showcase Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-display">
              Doctor Vai Live Module
            </h2>
            <p className="max-w-2xl text-sm text-slate-400">
              Evaluative review dashboard representing the Doctor Vai pitch deck, detailed technical manual integrations, and live production sync.
            </p>
          </div>

          {/* MODE TABS SWITCH */}
          <div className="mt-6 md:mt-0 flex bg-slate-900 border border-slate-850 p-1.5 rounded-2xl gap-2 justify-center">
            <button
              onClick={() => setActiveTab("pitch")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${activeTab === "pitch"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              YC Pitch Deck
            </button>
            <button
              onClick={() => setActiveTab("tech")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${activeTab === "tech"
                ? "bg-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              Technical Manual
            </button>
          </div>
        </section>

        {/* CORE WORKSPACE GRID */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start print:grid-cols-1">

          {/* MAIN DOCUMENTATION STREAM */}
          <div className="space-y-12">

            {/* Search Input Bar */}
            <div className="relative print:hidden">
              <Search className="absolute top-3.5 left-4 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder={`Search inside the ${activeTab === "pitch" ? "Pitch Deck" : "Technical whitepaper"} sections...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-750 focus:border-teal-500 focus:bg-slate-950/40 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none shadow-inner transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-3 right-4 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* SECTIONS RENDER STREAM */}
            <div className="space-y-10">
              {filteredSections.length === 0 ? (
                <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-8 text-center text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  No matching sections found for "{searchQuery}".
                </div>
              ) : (
                filteredSections.map((s, idx) => (
                  <article
                    key={s.id}
                    id={s.id}
                    className="relative group rounded-3xl border border-slate-850 bg-slate-900/25 p-6 sm:p-8 hover:border-slate-800 transition duration-300 shadow-sm print:border-none print:bg-transparent print:p-0 print:mb-12 print:break-inside-avoid"
                  >
                    {/* Floating anchor marker */}
                    <div className="absolute -left-3 top-8 hidden lg:block opacity-0 group-hover:opacity-100 transition print:hidden">
                      <a href={`#${s.id}`} className="text-teal-500 text-xs font-semibold uppercase tracking-wider">
                        #Anchor
                      </a>
                    </div>

                    {/* Section Header Controls */}
                    <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-5">
                      <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-display">
                        {s.title}
                      </h3>

                      {/* Admin reordering and editing options */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 print:hidden">
                          <button
                            onClick={() => reorderSection(sections.findIndex(x => x.id === s.id), "up")}
                            className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                            disabled={sections.findIndex(x => x.id === s.id) === 0}
                            title="Move section up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => reorderSection(sections.findIndex(x => x.id === s.id), "down")}
                            className="p-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none"
                            disabled={sections.findIndex(x => x.id === s.id) === sections.length - 1}
                            title="Move section down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSection(s);
                              setEditTitle(s.title);
                              setEditContent(s.content);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold transition"
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content Renderer */}
                    <div className="prose prose-invert max-w-none prose-teal text-slate-300 text-sm leading-relaxed prose-headings:font-display prose-headings:text-slate-100 prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-code:text-teal-400 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                      {/* Special handler for inline architecture diagrams */}
                      {s.id === "arch-diagram" ? (
                        <div className="my-6 space-y-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>

                          {/* HIGH-FIDELITY VECTOR DIAGRAM */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col items-center justify-center">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Interactive Vector Flow</p>
                            <svg className="w-full max-w-xl h-auto" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <defs>
                                <linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#0d9488" />
                                  <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                                <linearGradient id="gradSky" x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#0284c7" />
                                  <stop offset="100%" stopColor="#38bdf8" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="6" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              {/* Cards */}
                              <rect x="10" y="70" width="120" height="50" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                              <text x="70" y="100" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Next.js Client</text>

                              <path d="M130 95 H200" stroke="#14b8a6" strokeWidth="2" />

                              <rect x="200" y="70" width="140" height="50" rx="10" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" filter="url(#glow)" />
                              <text x="270" y="100" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">App Router APIs</text>

                              <path d="M340 85 H440" stroke="#0284c7" strokeWidth="2" />
                              <path d="M340 105 H440" stroke="#0284c7" strokeWidth="2" />

                              <rect x="440" y="40" width="140" height="50" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                              <text x="510" y="70" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">AI engine (Gemini)</text>

                              <rect x="440" y="120" width="140" height="50" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                              <text x="510" y="150" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">pgvector / Postgres</text>

                              {/* Connections */}
                              <path d="M270 120 V190 H130" stroke="#475569" strokeWidth="1.5" strokeDasharray="4" />
                              <rect x="10" y="170" width="120" height="40" rx="6" fill="#1e293b" stroke="#334155" />
                              <text x="70" y="194" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">NextAuth Shield</text>
                            </svg>
                          </div>
                        </div>
                      ) : s.id === "data-flow" ? (
                        <div className="my-6 space-y-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>

                          {/* HIGH-FIDELITY VECTOR DIAGRAM FOR DATA FLOW */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex flex-col items-center justify-center">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Verification Data Pipeline</p>
                            <svg className="w-full max-w-xl h-auto" viewBox="0 0 600 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Step boxes */}
                              <rect x="10" y="35" width="100" height="40" rx="8" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
                              <text x="60" y="59" fill="#14b8a6" fontSize="9" fontWeight="bold" textAnchor="middle">1. Symptom Text</text>

                              <path d="M110 55 H145" stroke="#475569" strokeWidth="1.5" />

                              <rect x="145" y="35" width="120" height="40" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                              <text x="205" y="59" fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">2. Semantic Vector</text>

                              <path d="M265 55 H300" stroke="#475569" strokeWidth="1.5" />

                              <rect x="300" y="35" width="125" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                              <text x="362" y="59" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">3. Textbook RAG Math</text>

                              <path d="M425 55 H460" stroke="#475569" strokeWidth="1.5" />

                              <rect x="460" y="35" width="130" height="40" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                              <text x="525" y="59" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">4. Grounded Output</text>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                      )}
                    </div>

                    {/* MANDATORY TEAM CARDS Grid layout inside Team Section */}
                    {s.id === "vision" && activeTab === "pitch" && (
                      <div className="mt-12 border-t border-slate-850 pt-8">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-bold text-white tracking-tight font-display">
                            Meet the Partners / Team
                          </h4>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setTeamForm([...team]);
                                setEditingTeam(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold transition cursor-pointer print:hidden"
                            >
                              Manage Team Registry
                            </button>
                          )}
                        </div>

                        {/* HIGH-FIDELITY TEAM GRID */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {team.map((m) => (
                            <div
                              key={m.id}
                              className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 flex flex-col items-center text-center shadow-inner hover:border-slate-800 transition duration-300"
                            >
                              <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-teal-500/30 bg-slate-900 flex items-center justify-center">
                                {m.avatarUrl ? (
                                  <img
                                    src={m.avatarUrl}
                                    alt={m.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : null}
                                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/20 to-transparent"></div>
                                {/* Fallback initials avatar */}
                                <span className="absolute text-teal-400 text-md font-bold uppercase">
                                  {m.name.slice(0, 2)}
                                </span>
                              </div>
                              <h5 className="font-semibold text-white text-sm">{m.name}</h5>
                              <p className="text-[10px] font-semibold text-teal-400 mt-0.5 uppercase tracking-wide">
                                {m.role}
                              </p>
                              <a
                                href={`mailto:${m.email}`}
                                className="text-slate-400 hover:text-teal-300 text-xs mt-2 underline block font-mono"
                              >
                                {m.email}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          {/* D. LIVE INTEGRATED SYSTEM DASHBOARD (SIDEBAR PANEL) */}
          <aside className="space-y-6 print:hidden">

            {/* REAL-TIME SYSTEM INDICATORS */}
            <div className="rounded-3xl border border-slate-850 bg-slate-900/30 p-5 shadow-lg backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-1.5">
                <Activity className="h-4 w-4 animate-pulse text-teal-400" />
                Live System metrics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Patients", val: stats.patients, icon: Users },
                  { label: "Intake Sessions", val: stats.sessions, icon: FileText },
                  { label: "Immunizations", val: stats.reminders, icon: CheckCircle },
                  { label: "AI Diagnoses", val: stats.aiDiagnostics, icon: Award },
                  { label: "RAG Docs Ingested", val: stats.knowledgeDocs, icon: Database },
                  { label: "Vector Chunks", val: stats.chunks, icon: Database },
                ].map((st) => {
                  const IconComp = st.icon;
                  return (
                    <div key={st.label} className="rounded-2xl bg-slate-950/60 border border-slate-850 p-3 shadow-inner flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 leading-tight font-medium max-w-[80%]">{st.label}</span>
                        <IconComp className="h-3.5 w-3.5 text-teal-500/60" />
                      </div>
                      <span className="font-mono text-xl font-bold text-white mt-2 block tracking-tight">
                        {st.val}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-850 pt-4">
                <button
                  onClick={async () => {
                    setRefreshStatsCount(refreshStatsCount + 1);
                    await fetchStats();
                  }}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5" />
                  Sync Latest State
                </button>
              </div>
            </div>

            {/* LIVE EVENT LOGGING STREAM */}
            <div className="rounded-3xl border border-slate-850 bg-slate-900/30 p-5 shadow-lg backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-4 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-400" />
                Live activity feed
              </h3>

              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {events.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-900 bg-slate-950/40 p-2.5 text-[11px] leading-relaxed shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide ${ev.category === "Intake"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : ev.category === "Diagnosis"
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                            : ev.category === "Immunization"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                      >
                        {ev.category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-200">{ev.title}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK SECTIONS JUMP NAV */}
            <div className="rounded-3xl border border-slate-850 bg-slate-900/30 p-5 shadow-lg backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-teal-400 mb-3">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {filteredSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSectionId(s.id)}
                    className={`block py-1.5 px-2.5 rounded-lg text-xs font-medium transition ${activeSectionId === s.id
                      ? "bg-teal-500/15 text-teal-300 border-l-2 border-teal-500"
                      : "text-slate-400 hover:text-white hover:bg-slate-850/50"
                      }`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-slate-850 mt-16 text-center text-xs text-slate-500 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded bg-teal-500/10 p-1 text-teal-400 font-bold">DV</div>
            <span>Doctor Vai Portfolio Companion</span>
          </div>
          <div className="flex gap-4">
            <button onClick={copyShareLink} className="hover:text-teal-400 transition flex items-center gap-1">
              <Share2 className="h-3 w-3" /> Share Link
            </button>
            <span className="text-slate-600">|</span>
            <span>Local Time: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Doctor Vai. Deployed for resilient clinical care support.</p>
      </footer>

      {/* MODAL 1: WYSIWYG DOCUMENT SECTION EDITOR */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Edit3 className="h-4 w-4 text-teal-400" />
                Edit Section: {editingSection.title}
              </h4>
              <button
                onClick={() => setEditingSection(null)}
                className="rounded-full hover:bg-slate-850 p-1 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Section Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-200 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Content (Markdown supported)</label>

                  {/* Version History Check */}
                  {versionHistory[editingSection.id] && versionHistory[editingSection.id].length > 0 && (
                    <div className="flex items-center gap-1 text-[9px] text-teal-400">
                      <History className="h-3 w-3" />
                      Restore Draft:
                      {versionHistory[editingSection.id].map((h, i) => (
                        <button
                          key={i}
                          onClick={() => restorePreviousVersion(editingSection.id, h)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-750 font-bold transition text-teal-300"
                          title="Restore this session's earlier version"
                        >
                          v{i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-200 font-mono outline-none focus:border-teal-500 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-850 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                disabled={savingSection}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                {savingSection ? "Saving..." : "Publish Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TEAM REGISTRY MANAGER */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Users className="h-4 w-4 text-teal-400" />
                Manage Team Registry
              </h4>
              <button
                onClick={() => setEditingTeam(false)}
                className="rounded-full hover:bg-slate-850 p-1 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {teamForm.map((m, idx) => (
                <div key={m.id || idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 relative text-xs">
                  <button
                    onClick={() => {
                      const updated = teamForm.filter((_, i) => i !== idx);
                      setTeamForm(updated);
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-slate-800 text-rose-500 rounded transition"
                    title="Remove team member"
                  >
                    <Trash className="h-4 w-4" />
                  </button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500">Name</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => {
                          const updated = [...teamForm];
                          updated[idx].name = e.target.value;
                          setTeamForm(updated);
                        }}
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500">Role</label>
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => {
                          const updated = [...teamForm];
                          updated[idx].role = e.target.value;
                          setTeamForm(updated);
                        }}
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500">Email Address</label>
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => {
                          const updated = [...teamForm];
                          updated[idx].email = e.target.value;
                          setTeamForm(updated);
                        }}
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-500">Avatar Image URL</label>
                      <input
                        type="text"
                        value={m.avatarUrl}
                        onChange={(e) => {
                          const updated = [...teamForm];
                          updated[idx].avatarUrl = e.target.value;
                          setTeamForm(updated);
                        }}
                        className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setTeamForm([
                    ...teamForm,
                    {
                      id: String(Date.now()),
                      name: "New Associate",
                      role: "Clinical Developer",
                      email: "associate@doctorvai.gov",
                      avatarUrl: "",
                    },
                  ]);
                }}
                className="w-full py-2 border border-dashed border-teal-500/30 hover:border-teal-500/50 bg-teal-500/5 hover:bg-teal-500/10 rounded-xl text-teal-400 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Team Member
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
              <button
                onClick={() => setEditingTeam(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-850 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => saveTeam(teamForm)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
