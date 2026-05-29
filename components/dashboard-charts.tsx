"use client";

import { useEffect, useRef } from "react";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

type DashboardChartsProps = {
  consultationLabels: string[];
  consultationSeries: number[];
  riskLabels: string[];
  riskSeries: number[];
  moduleUsage: number[];
};

export function DashboardCharts({
  consultationLabels,
  consultationSeries,
  riskLabels,
  riskSeries,
  moduleUsage,
}: DashboardChartsProps) {
  const consultationsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const triageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const moduleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const consultationChart = consultationsCanvasRef.current
      ? new Chart(consultationsCanvasRef.current, {
          type: "line",
          data: {
            labels: consultationLabels,
            datasets: [
              {
                label: "Sessions",
                data: consultationSeries,
                borderColor: "rgb(14, 165, 233)",
                backgroundColor: "rgba(14, 165, 233, 0.12)",
                pointBackgroundColor: "rgb(14, 165, 233)",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                tension: 0.35,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f8fafc",
                bodyColor: "#e2e8f0",
                padding: 12,
              },
            },
            scales: {
              x: {
                grid: { color: "rgba(148, 163, 184, 0.14)" },
                ticks: { color: "#64748b" },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(148, 163, 184, 0.14)" },
                ticks: { color: "#64748b" },
              },
            },
          },
        })
      : null;

    const triageChart = triageCanvasRef.current
      ? new Chart(triageCanvasRef.current, {
          type: "doughnut",
          data: {
            labels: riskLabels,
            datasets: [
              {
                data: riskSeries,
                backgroundColor: ["#38bdf8", "#fbbf24", "#ef4444"],
                borderColor: "#ffffff",
                borderWidth: 4,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#334155",
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f8fafc",
                bodyColor: "#e2e8f0",
              },
            },
          },
        })
      : null;

    const moduleChart = moduleCanvasRef.current
      ? new Chart(moduleCanvasRef.current, {
          type: "bar",
          data: {
            labels: ["Session", "Guidance", "Risk", "AI"],
            datasets: [
              {
                label: "Usage",
                data: moduleUsage,
                borderRadius: 12,
                backgroundColor: ["#0ea5e9", "#14b8a6", "#f59e0b", "#6366f1"],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#f8fafc",
                bodyColor: "#e2e8f0",
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "#64748b" },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(148, 163, 184, 0.14)" },
                ticks: { color: "#64748b" },
              },
            },
          },
        })
      : null;

    return () => {
      consultationChart?.destroy();
      triageChart?.destroy();
      moduleChart?.destroy();
    };
  }, []);

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 to-slate-900 p-5 text-white shadow-sm xl:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
              Operational trend
            </p>
            <h2 className="mt-2 text-lg font-semibold">Weekly consultation volume</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
            +24% vs last week
          </div>
        </div>

        <div className="mt-4 h-72">
          <canvas ref={consultationsCanvasRef} />
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
          Triage mix
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Attention levels</h2>
        <div className="mt-4 h-72">
          <canvas ref={triageCanvasRef} />
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              Tool usage
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Most active dashboard modules</h2>
          </div>
          <p className="text-sm text-slate-500">Higher bars indicate more recent activity across the team.</p>
        </div>

        <div className="mt-4 h-72">
          <canvas ref={moduleCanvasRef} />
        </div>
      </article>
    </section>
  );
}