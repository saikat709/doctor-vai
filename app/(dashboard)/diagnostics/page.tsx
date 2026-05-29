import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          Diagnostics
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Risk + disease analytics
        </h1>
        <p className="text-sm text-slate-600">
          Review AI-generated risk tiers and suggested diagnostic follow-ups.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk assessment</CardTitle>
          </CardHeader>
          <CardContent>
            Summaries of attention level, vitals flags, and urgent safeguards.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Differential guidance</CardTitle>
          </CardHeader>
          <CardContent>
            Suggested diagnoses with likelihood and recommended tests.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
