import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { FloatingAiChat } from "@/components/floating-ai-chat";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="mx-auto grid h-full min-h-0 max-w-full grid-cols-1 lg:grid-cols-[288px_1fr]">
        <Sidebar user={session?.user} />
        <main className="relative z-0 h-full min-h-0 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <FloatingAiChat />
    </div>
  );
}
