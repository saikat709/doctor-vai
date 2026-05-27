import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedSymptoms, notes, consultationId } = await req.json();

    if (!selectedSymptoms || selectedSymptoms.length === 0) {
      return NextResponse.json(
        { error: "At least one symptom is required" },
        { status: 400 }
      );
    }

    const symptomList = selectedSymptoms.join(", ");

    const prompt = `You are a clinical decision support system. A patient presents with the following symptoms: ${symptomList}.${
      notes ? ` Additional clinical notes: ${notes}` : ""
    }

Provide a differential diagnosis ranked by likelihood. Respond with ONLY a valid JSON object — no markdown, no explanation, no preamble.

Schema:
{
  "diagnoses": [
    {
      "diseaseName": "string",
      "likelihood": "High" | "Medium" | "Low",
      "nextDiagnosticTest": "string"
    }
  ]
}

Rules:
- Return 3 to 6 conditions maximum.
- Rank from most to least likely.
- nextDiagnosticTest must be a specific actionable test (lab, imaging, or clinical).
- Never state a definitive diagnosis. Use probabilistic clinical language.`;

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "";

    const cleaned = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.diagnoses || !Array.isArray(parsed.diagnoses)) {
      throw new Error("Invalid response schema from model");
    }

    if (consultationId) {
      await db.diseaseAssessment.create({
        data: {
          consultationId,
          symptoms: selectedSymptoms,
          notes: notes ?? "",
          result: parsed,
        },
      });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[DISEASE_DETECTION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process differential diagnosis" },
      { status: 500 }
    );
  }
}