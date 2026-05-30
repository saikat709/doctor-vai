import { NextRequest, NextResponse } from "next/server";
import { invokeDeepSeekStructured } from "@/lib/deepseek";

type Diagnosis = {
  diseaseName: string;
  likelihood: "High" | "Medium" | "Low";
  nextDiagnosticTest: string;
};

type DiseaseResult = {
  diagnoses: Diagnosis[];
};

const diseaseSchema = {
  type: "object",
  properties: {
    diagnoses: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          diseaseName: { type: "string" },
          likelihood: { type: "string", enum: ["High", "Medium", "Low"] },
          nextDiagnosticTest: { type: "string" },
        },
        required: ["diseaseName", "likelihood", "nextDiagnosticTest"],
        additionalProperties: false,
      },
    },
  },
  required: ["diagnoses"],
  additionalProperties: false,
} as const;

export async function POST(req: NextRequest) {
  try {
    const { selectedSymptoms, notes } = await req.json();

    if (!selectedSymptoms || selectedSymptoms.length === 0) {
      return NextResponse.json(
        { error: "At least one symptom is required" },
        { status: 400 }
      );
    }

    const symptomList = selectedSymptoms.join(", ");

    const result = await invokeDeepSeekStructured<DiseaseResult>({
      model: "deepseek-chat",
      temperature: 0.3,
      systemPrompt:
        "You are a clinical decision support system. Never state a definitive diagnosis. Return only JSON with a diagnoses array. Each item must include diseaseName, likelihood, and nextDiagnosticTest.",
      userPrompt: `A patient presents with the following symptoms: ${symptomList}.${notes ? ` Additional clinical notes: ${notes}` : ""}\n\nReturn 3 to 6 conditions maximum, ranked from most to least likely. nextDiagnosticTest must be a specific actionable test (lab, imaging, or clinical).`,
      schema: diseaseSchema,
      knowledgeQuery: [selectedSymptoms.join(" "), notes].filter(Boolean).join(" "),
      knowledgeLimit: 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[DISEASE_DETECTION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process differential diagnosis" },
      { status: 500 }
    );
  }
}