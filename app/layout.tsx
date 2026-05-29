import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter, Sora, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

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
  title: "Doctor Vai | AidPulse AI",
  description:
    "A focused AI companion for clinical shifts, fast handovers, and safer care decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        sora.variable,
        spaceGrotesk.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}