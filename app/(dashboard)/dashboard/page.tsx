import Link from "next/link";
import { Download } from "lucide-react";
import { DashboardCharts } from "../../../components/dashboard-charts";
import { db } from "../../../lib/db";

function formatDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function withTimeoutFallback<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
  fallback: T
): Promise<T> {
  try {
    return await withTimeout(promise, timeoutMs, label);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown query error";
    console.warn(`[DASHBOARD_QUERY_WARN] ${label}: ${message}. Falling back to safe default.`);
    return fallback;
  }
}

export default async function DashboardHomePage() {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const recentSessionsPromise = withTimeoutFallback(
    db.consultationSession.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    8000,
    "consultationSession.findMany(recent)",
    []
  );

  const riskAssessmentsPromise = withTimeoutFallback(
    db.riskAssessment.findMany({
      select: {
        attentionLevel: true,
      },
    }),
    8000,
    "riskAssessment.findMany",
    []
  );

  const sessionsCountPromise = withTimeoutFallback(
    db.consultationSession.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    8000,
    "consultationSession.count",
    0
  );

  const diseaseCountPromise = withTimeoutFallback(
    db.diseaseAssessment.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    8000,
    "diseaseAssessment.count",
    0
  );

  const medicineCountPromise = withTimeoutFallback(
    db.medicineCheck.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    8000,
    "medicineCheck.count",
    0
  );

  const remindersCountPromise = withTimeoutFallback(
    db.vaccinationReminder.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    8000,
    "vaccinationReminder.count",
    0
  );

  const documentsCountPromise = withTimeoutFallback(
    db.knowledgeDocument.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    8000,
    "knowledgeDocument.count",
    0
  );

  const [recentSessions, riskAssessments, sessionsCount, diseaseCount, medicineCount, remindersCount, documentsCount] = await Promise.all([
    recentSessionsPromise,
    riskAssessmentsPromise,
    sessionsCountPromise,
    diseaseCountPromise,
    medicineCountPromise,
    remindersCountPromise,
    documentsCountPromise,
  ]);

  const consultationLabels: string[] = [];
  const consultationSeries: number[] = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    const dayKey = formatDayKey(date);
    consultationLabels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
    consultationSeries.push(
      recentSessions.filter((session) => formatDayKey(session.createdAt) === dayKey).length
    );
  }

  const riskLabels = ["Standard Care", "Monitor Closely", "High Priority"];
  const riskSeries = riskLabels.map((label) =>
    riskAssessments.filter((assessment) => assessment.attentionLevel === label).length
  );

  const moduleUsage = [sessionsCount, diseaseCount, medicineCount, remindersCount + documentsCount];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Clinical workspace overview
        </h1>
        <p className="text-sm text-slate-600">
          Start a session, review guidance, or move into risk and disease detection.
        </p>
      </header>

      <DashboardCharts
        consultationLabels={consultationLabels}
        consultationSeries={consultationSeries}
        riskLabels={riskLabels}
        riskSeries={riskSeries}
        moduleUsage={moduleUsage}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/dashboard/session" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Patient intake session</p>
          <p className="mt-2 text-sm text-slate-600">Capture symptoms and triage details.</p>
        </Link>
        <Link href="/dashboard/guidance" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Treatment guidance</p>
          <p className="mt-2 text-sm text-slate-600">Follow structured medical procedures.</p>
        </Link>
        <Link href="/dashboard/interactions" className="rounded-2xl border border-slate-200 p-5 transition hover:border-sky-300 hover:bg-sky-50">
          <p className="text-sm font-semibold text-slate-900">Medicine interaction</p>
          <p className="mt-2 text-sm text-slate-600">Verify prescriptions and alternatives.</p>
        </Link>
        <Link href="/offline" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:border-emerald-300 hover:bg-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <Download className="h-4 w-4" />
            <p className="text-sm font-semibold">Offline</p>
          </div>
          <p className="mt-2 text-sm text-emerald-900">Download Windows and Linux desktop builds.</p>
        </Link>
      </div>
    </div>
  );
}
