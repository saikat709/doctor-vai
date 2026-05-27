import { Sidebar } from "@/components/sidebar";
import { FloatingAiChat } from "@/components/floating-ai-chat";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[288px_1fr]">
        <Sidebar />
        <main className="relative z-0 px-4 py-6 lg:px-6 lg:py-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <FloatingAiChat />
    </div>
  );
}
