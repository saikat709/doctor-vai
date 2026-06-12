import { NextResponse } from "next/server";
import { isOffline } from "@/lib/env";

export function GET() {
  return NextResponse.json({ offline: isOffline });
}
