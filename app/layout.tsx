import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter, Sora, Space_Grotesk, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
      <body className="min-h-full flex flex-col bg-[#090912] text-[#e8e0f0] font-sans">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}