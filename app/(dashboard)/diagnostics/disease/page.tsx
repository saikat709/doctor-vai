"use client";

import { useState } from "react";
import { Loader2, Stethoscope, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Chills",
  "Fatigue",
  "Dyspnea",
  "Diarrhea",
  "Vomiting",
  "Jaundice",
  "Rash",
  "Abdominal Pain",
  "Headache",
  "Chest Pain",
  "Sore Throat",
  "Night Sweats",
  "Weight Loss",
  "Numbness",
  "Dizziness",
  "Palpitations",
  "Joint Pain",
  "Edema",
];

type Likelihood = "High" | "Medium" | "Low";

interface Diagnosis {
  diseaseName: string;
  likelihood: Likelihood;
  nextDiagnosticTest: string;
}

const likelihoodStyles: Record<Likelihood, string> = {
  High: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export default function DiseaseDetectionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setDiagnoses([]);

    try {
      const res = await fetch("/api/diagnostics/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSymptoms, notes }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Unknown error");
      }

      const data = await res.json();
      setDiagnoses(data.diagnoses);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Disease Detection
          </h1>
          <p className="text-sm text-muted-foreground">
            Select presenting symptoms to generate a ranked differential
            diagnosis
          </p>
        </div>
      </div>

      {/* Symptom Selector */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Common Presenting Symptoms
        </h2>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.map((symptom) => {
            const active = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                {symptom}
              </button>
            );
          })}
        </div>

        {selectedSymptoms.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedSymptoms.length} symptom
            {selectedSymptoms.length > 1 ? "s" : ""} selected:{" "}
            <span className="text-foreground font-medium">
              {selectedSymptoms.join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Additional Clinical Manifestations & Notes
        </h2>
        <Textarea
          placeholder="e.g. Dry hacking cough for 10 days, persistent evening fevers, significant unexplained weight loss over 3 weeks..."
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
          rows={4}
          className="resize-none text-sm"
        />
      </div>

      {/* Submit */}
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || selectedSymptoms.length === 0}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Differential Diagnostic Computation...
          </>
        ) : (
          <>
            <FlaskConical className="mr-2 h-4 w-4" />
            Run Differential Diagnostic Computation
          </>
        )}
      </Button>

      {/* Results Table */}
      {diagnoses.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">
              Differential Diagnoses Screening
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by likelihood. This is a clinical decision support tool —
              not a substitute for physician judgment.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Disease / Condition</TableHead>
                <TableHead className="w-[15%]">Likelihood</TableHead>
                <TableHead>Recommended Next Diagnostic Step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnoses.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.diseaseName}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-semibold text-xs",
                        likelihoodStyles[d.likelihood]
                      )}
                    >
                      {d.likelihood}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.nextDiagnosticTest}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}