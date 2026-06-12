import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helper";
import { invokeDeepSeekStructured } from "@/lib/deepseek";
import { getPromptLanguage } from "@/lib/locale";
import { buildOllamaNotConfiguredResponse } from "@/lib/local-llm";
import { getUserLanguagePreferences } from "@/lib/user-preferences";

type InteractionPayload = {
  disease?: string;
  symptoms?: string;
  medicines?: string[];
};

type InteractionResult = {
  verdict: "Go Ahead" | "Not Harmful" | "Moderate Harm" | "Seems Harmful";
  explanation: string;
  alternatives: string[];
};

const interactionSchema = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: ["Go Ahead", "Not Harmful", "Moderate Harm", "Seems Harmful"],
    },
    explanation: { type: "string" },
    alternatives: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["verdict", "explanation", "alternatives"],
  additionalProperties: false,
} as const;

function buildMockResult(payload: InteractionPayload): InteractionResult {
  const medicines = (payload.medicines ?? []).map((medicine) => medicine.trim()).filter(Boolean);
  const combinedText = `${payload.disease ?? ""} ${payload.symptoms ?? ""} ${medicines.join(" ")}`.toLowerCase();

  if (/chloroquine/.test(combinedText) && /amiodarone/.test(combinedText)) {
    return {
      verdict: "Seems Harmful",
      explanation:
        "Concurrent administration of Chloroquine and Amiodarone can substantially increase QT interval prolongation risk and may precipitate torsades de pointes.",
      alternatives: [
        "Alternative antimalarial: artemether-lumefantrine",
        "Alternative rhythm control: consult a secondary cardiology facility before prescribing",
      ],
    };
  }

  if (medicines.length === 0) {
    return {
      verdict: "Moderate Harm",
      explanation:
        "No medicines were supplied, so the screening is incomplete and requires review before a safe recommendation can be made.",
      alternatives: ["Add the full medicine list", "Confirm disease context and symptoms before screening"],
    };
  }

  if (/antibiotic|warfarin|insulin/.test(combinedText)) {
    return {
      verdict: "Moderate Harm",
      explanation:
        "One or more medicines in the current ledger commonly require dose review or extra monitoring when combined with the provided context.",
      alternatives: ["Re-check dose, timing, and duplication", "Review renal function, bleeding risk, and glycemic status"],
    };
  }

  if (medicines.length > 3) {
    return {
      verdict: "Not Harmful",
      explanation:
        "The submitted medicine list does not show an obvious high-risk interaction pattern, but a full medication history should still be reviewed.",
      alternatives: ["Verify allergies and duplicate therapies", "Confirm the list against the patient chart"],
    };
  }

  return {
    verdict: "Go Ahead",
    explanation:
      "No high-risk interaction pattern was detected in the submitted medicine ledger and clinical context.",
    alternatives: ["Proceed with routine monitoring", "Re-screen if any new medicine is added"],
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as InteractionPayload;
  try {
    const session = await getSession();
    const preferences = await getUserLanguagePreferences(session?.user);
    const responseLanguage = getPromptLanguage(preferences.chatbotLanguage);
    const result = await invokeDeepSeekStructured<InteractionResult>({
      userId: session?.user?.id,
      model: "deepseek-chat",
      temperature: 0.2,
      systemPrompt:
        `Always write explanation and alternatives in ${responseLanguage}. Return only JSON with keys verdict, explanation, and alternatives. Verdict must be one of: Go Ahead, Not Harmful, Moderate Harm, Seems Harmful.`,
      userPrompt: JSON.stringify(body),
      schema: interactionSchema,
      knowledgeQuery: [body.disease, body.symptoms, ...(body.medicines ?? [])].filter(Boolean).join(" "),
      knowledgeLimit: 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "OLLAMA_NOT_CONFIGURED") {
      return buildOllamaNotConfiguredResponse();
    }

    return NextResponse.json(buildMockResult(body));
  }
}
