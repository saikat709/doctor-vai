"use client";

import { useEffect, useState } from "react";
import { Syringe, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Status = "Overdue" | "Pending" | "Completed";

interface VaccinationRecord {
  id: string;
  patientName: string;
  patientAge: string;
  vaccineType: string;
  administeredDate: string;
  nextDoseDueDate: string;
  status: Status;
}

const VACCINES = [
  "BCG (Tuberculosis)",
  "HepB (Hepatitis B)",
  "Pentavalent (DPT+HepB+Hib)",
  "OPV (Polio)",
  "PCV (Pneumococcal)",
  "MMR (Measles+Mumps+Rubella)",
  "Rotavirus",
  "IPV (Inactivated Polio)",
  "Varicella",
  "Typhoid",
];

const statusStyles: Record<Status, string> = {
  Overdue:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse",
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function computeStatus(nextDoseDueDate: string, manualStatus: Status): Status {
  if (manualStatus === "Completed") return "Completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDoseDueDate);
  return due < today ? "Overdue" : "Pending";
}

function timeDelta(nextDoseDueDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDoseDueDate);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Due Today";
  if (diffDays < 0) return `${Math.abs(diffDays)} Days Overdue`;
  return `${diffDays} Days Left`;
}

function sortRecords(records: VaccinationRecord[]): VaccinationRecord[] {
  return [...records].sort((a, b) => {
    const statusA = computeStatus(a.nextDoseDueDate, a.status);
    const statusB = computeStatus(b.nextDoseDueDate, b.status);
    const order: Record<Status, number> = { Overdue: 0, Pending: 1, Completed: 2 };
    if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
    return new Date(a.nextDoseDueDate).getTime() - new Date(b.nextDoseDueDate).getTime();
  });
}

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  patientName: "",
  patientAge: "",
  vaccineType: "",
  administeredDate: today,
  nextDoseDueDate: "",
};

export default function RemindersPage() {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | Status>("All");
  const [isRecordsLoading, setIsRecordsLoading] = useState(true);

  const handleField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.patientName.trim() ||
      !form.patientAge ||
      !form.vaccineType ||
      !form.administeredDate ||
      !form.nextDoseDueDate
    ) {
      setFormError("All fields are required.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await fetch("/api/reminders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const newRecord: VaccinationRecord = {
        id: crypto.randomUUID(),
        ...form,
        status: "Pending",
      };

      setRecords((prev) => [...prev, newRecord]);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      setFormError("Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    await fetch(`/api/reminders/${id}/complete`, { method: "PATCH" });
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Completed" } : r))
    );
  };

  const enriched = sortRecords(records).map((r) => ({
    ...r,
    computedStatus: computeStatus(r.nextDoseDueDate, r.status),
    delta: timeDelta(r.nextDoseDueDate),
  }));

  const filtered =
    activeFilter === "All"
      ? enriched
      : enriched.filter((r) => r.computedStatus === activeFilter);

  const counts = {
    Overdue: enriched.filter((r) => r.computedStatus === "Overdue").length,
    Pending: enriched.filter((r) => r.computedStatus === "Pending").length,
    Completed: enriched.filter((r) => r.computedStatus === "Completed").length,
  };

  useEffect(() => {
    setIsRecordsLoading(true);
    const fetchRecords = async () => {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setRecords(data.records);
    };
    try {
      fetchRecords();
    } catch (err) {
      toast.error("Failed to load records.");
    } finally {
      setIsRecordsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Syringe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vaccination Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            Log immunization records and track upcoming or overdue doses
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Record Immunization Entry
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Anisur Rahman"
              value={form.patientName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleField("patientName", e.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Patient Age (Months)</label>
            <input
              type="number"
              placeholder="e.g. 2"
              min={0}
              value={form.patientAge}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleField("patientAge", e.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Vaccine Type</label>
            <Select
              value={form.vaccineType}
              onValueChange={(val) => handleField("vaccineType", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vaccine..." />
              </SelectTrigger>
              <SelectContent>
                {VACCINES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Administered Date</label>
            <input
              type="date"
              value={form.administeredDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleField("administeredDate", e.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">Next Dose Due Date</label>
            <input
              type="date"
              value={form.nextDoseDueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleField("nextDoseDueDate", e.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {formError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{formError}</p>
        )}

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Log Immunization Entry
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Overdue", "Pending", "Completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            {f}
            {f !== "All" && counts[f] > 0 && (
              <span className="ml-1.5 text-xs opacity-80">({counts[f]})</span>
            )}
            {f === "All" && records.length > 0 && (
              <span className="ml-1.5 text-xs opacity-80">({records.length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.patientName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.vaccineType.split(" ")[0]}
                  </TableCell>
                  <TableCell className="text-sm">{r.nextDoseDueDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.computedStatus === "Completed" ? "Administered" : r.delta}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        statusStyles[r.computedStatus]
                      )}
                    >
                      {r.computedStatus.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.computedStatus !== "Completed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkDone(r.id)}
                      >
                        Mark Done
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Archived</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Syringe className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {records.length === 0
              ? "No records yet. Log the first immunization entry above."
              : "No records match this filter."}
          </p>
        </div>
      )}
    </div>
  );
}