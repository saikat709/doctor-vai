import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SessionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          Unified Intake
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Patient consultation session
        </h1>
        <p className="text-sm text-slate-600">
          Capture symptoms, comorbidities, and triage context once per patient.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Presenting symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            Document the primary symptoms and onset details for rapid AI triage.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vitals snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            Record blood pressure, pulse, SpO2, and temperature for screening.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
