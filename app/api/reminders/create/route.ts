import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let patientId = String(body.patientId ?? "").trim();
    const patientName = String(body.patientName ?? "").trim();
    const vaccineType = String(body.vaccineType ?? "").trim();
    const administeredDate = body.administeredDate
      ? new Date(String(body.administeredDate))
      : new Date();
    const nextDoseDueDate = body.nextDoseDueDate
      ? new Date(String(body.nextDoseDueDate))
      : null;

    if (!vaccineType || !nextDoseDueDate) {
      return NextResponse.json(
        { error: "`vaccineType` and `nextDoseDueDate` are required." },
        { status: 400 }
      );
    }

    // If no patientId provided, create a lightweight placeholder patient.
    if (!patientId) {
      const created = await db.patient.create({
        data: {
          name: patientName || "Reminder Patient",
          age: Number(body.patientAge ?? 0) || 0,
          gender: String(body.patientGender ?? "Other"),
        },
      });
      patientId = created.id;
    }

    const reminder = await db.vaccinationReminder.create({
      data: {
        patientId,
        vaccineType,
        administeredDate,
        nextDoseDueDate,
        status: body.status ?? "Pending",
      },
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}