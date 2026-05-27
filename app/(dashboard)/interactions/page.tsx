import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InteractionsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          Medicine Safety
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Cross-prescription verification
        </h1>
        <p className="text-sm text-slate-600">
          Check medication conflicts and identify safer alternatives.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescribed medicines</CardTitle>
          </CardHeader>
          <CardContent>
            Capture current medications and run a DeepSeek safety screen.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Safety verdict</CardTitle>
          </CardHeader>
          <CardContent>
            Show AI verdicts, explanations, and safer alternatives.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
