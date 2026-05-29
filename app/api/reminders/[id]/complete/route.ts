import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Connect to Prisma when database is ready
    // await prisma.vaccinationReminder.update({
    //   where: { id },
    //   data: { status: "Completed" },
    // });

    return NextResponse.json({
      success: true,
      message: "Reminder marked as completed",
      id,
    });
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