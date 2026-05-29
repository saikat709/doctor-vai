import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const reminders = await db.vaccinationReminder.findMany({
      orderBy: [{ nextDoseDueDate: "asc" }, { createdAt: "desc" }],
      include: {
        patient: {
          select: {
            name: true,
            age: true,
          },
        },
      },
    });

    console.log("[REMINDERS_LIST]", reminders);
    return NextResponse.json({
      records: reminders.map((reminder) => ({
        id: reminder.id,
        patientName: reminder.patient.name,
        patientAge: String(reminder.patient.age),
        vaccineType: reminder.vaccineType,
        administeredDate: toDateInputValue(reminder.administeredDate),
        nextDoseDueDate: toDateInputValue(reminder.nextDoseDueDate),
        status: reminder.status,
      })),
    });
  } catch (error) {
    console.error("[REMINDERS_LIST_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to load reminders", records: [] },
      { status: 500 }
    );
  }
}