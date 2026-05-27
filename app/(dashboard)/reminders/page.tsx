import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          Immunization
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Vaccination reminders
        </h1>
        <p className="text-sm text-slate-600">
          Track upcoming doses and outreach status for each patient.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming doses</CardTitle>
          </CardHeader>
          <CardContent>
            See scheduled vaccinations and automated follow-up timelines.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outreach status</CardTitle>
          </CardHeader>
          <CardContent>
            Mark completion, reschedule, or record pending outreach notes.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
