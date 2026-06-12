import { getSession } from "@/lib/auth-helper";
import DocsClient from "./DocsClient";

export const metadata = {
  title: "Doctor Vai Showcase & Documentation Portal",
  description: "Continuous synchronization, judging window availability filters, YC Business Pitch deck, and engineering whitepaper logs.",
};

export default async function DocsPage() {
  const session = await getSession();
  return <DocsClient user={session?.user || null} />;
}
