import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { defaultDocsConfig, defaultDocSections, defaultTeamMembers } from "@/lib/docs-default";

// GET /api/docs/config
// Returns current configuration, sections, team, and public access evaluation
export async function GET() {
  try {
    const session = await auth();
    const isAdmin = session?.user && (session.user as { role?: string }).role && ["Admin", "SuperAdmin"].includes((session.user as { role?: string }).role || "");

    // Fetch config
    const configRecord = await db.assistantMemory.findUnique({
      where: { key: "docs_config" },
    });
    const config = configRecord ? JSON.parse(configRecord.value) : defaultDocsConfig;

    // Fetch sections
    const sectionsRecord = await db.assistantMemory.findUnique({
      where: { key: "docs_sections" },
    });
    const sections = sectionsRecord ? JSON.parse(sectionsRecord.value) : defaultDocSections;

    // Fetch team
    const teamRecord = await db.assistantMemory.findUnique({
      where: { key: "docs_team" },
    });
    const team = teamRecord ? JSON.parse(teamRecord.value) : defaultTeamMembers;

    // Evaluate public accessibility
    let isPubliclyAccessible = false;

    if (config.overrideActive) {
      isPubliclyAccessible = config.overridePublicValue;
    } else {
      // Normal schedule-based access check
      const now = new Date();
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      isPubliclyAccessible = config.publicAccess && now >= start && now <= end;
    }

    return NextResponse.json({
      config,
      sections,
      team,
      isPubliclyAccessible,
      bypass: !!isAdmin, // Admin bypasses the lock
    });
  } catch (error) {
    console.error("[DOCS_CONFIG_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/docs/config
// Updates a specific part of the configuration ("config", "sections", "team")
export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;

    if (!session || !role || !["Admin", "SuperAdmin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data parameters" }, { status: 400 });
    }

    let key = "";
    if (type === "config") {
      key = "docs_config";
    } else if (type === "sections") {
      key = "docs_sections";
    } else if (type === "team") {
      key = "docs_team";
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'config', 'sections', or 'team'" }, { status: 400 });
    }

    // Save into AssistantMemory (acting as our flexible key-value store)
    const valueStr = JSON.stringify(data);
    await db.assistantMemory.upsert({
      where: { key },
      update: { value: valueStr },
      create: { key, value: valueStr },
    });

    return NextResponse.json({ success: true, message: `${type} updated successfully` });
  } catch (error) {
    console.error("[DOCS_CONFIG_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
