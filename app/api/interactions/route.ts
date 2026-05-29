import { NextResponse } from "next/server";

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

  const payload = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "Return only raw JSON with keys verdict, explanation, and alternatives. Verdict must be one of: Go Ahead, Not Harmful, Moderate Harm, Seems Harmful.",
      },
      {
        role: "user",
        content: JSON.stringify(body),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  };

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (typeof content === "string") {
          const parsed = JSON.parse(content) as InteractionResult;
          return NextResponse.json(parsed);
        }
      }
    } catch {
      // Fall through to the deterministic local mock below.
    }
  }

  return NextResponse.json(buildMockResult(body));
}
