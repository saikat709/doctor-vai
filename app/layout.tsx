import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { isAppLocale } from "@/lib/locale";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-label",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doctor Vai",
  description:
    "A focused AI companion for clinical shifts, fast handovers, and safer care decisions.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("preferred_locale")?.value;
  const htmlLang = isAppLocale(cookieLocale ?? "") ? cookieLocale : "en";

  return (
    <html
      lang={htmlLang}
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        sora.variable,
        spaceGrotesk.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
