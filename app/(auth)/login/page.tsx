import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
          Secure Access
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Sign in to Doctor Vai
        </h1>
        <p className="text-sm text-slate-600">
          Use your assigned clinical credentials to unlock the dashboard.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Email</label>
          <Input placeholder="worker@health.gov" type="email" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Password</label>
          <Input placeholder="password123" type="password" />
        </div>
        <Button type="button" className="w-full">
          Continue to dashboard
        </Button>
      </form>

      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-xs text-teal-800">
        <p className="font-semibold">Demo access</p>
        <p className="mt-1">
          Sign in with worker@health.gov / password123 to simulate a clinician.
        </p>
      </div>

      <Link href="/" className="text-xs font-semibold text-teal-700">
        Return to public landing
      </Link>
    </div>
  );
}
