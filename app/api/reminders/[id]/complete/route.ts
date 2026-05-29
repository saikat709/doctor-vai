import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const updated = await db.vaccinationReminder.update({
      where: { id },
      data: { status: "Completed" },
    }).catch((e) => {
      // Prisma returns P2025 when the record is not found
      if ((e as any)?.code === "P2025") {
        return null;
      }
      throw e;
    });

    if (!updated) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, reminder: updated });
  } catch (error) {
    console.error("[REMINDERS_COMPLETE_ERROR]", error);

    return NextResponse.json(
      {
        error: "Failed to update record",
      },
      {
        status: 500,
      }
    );
  }
}