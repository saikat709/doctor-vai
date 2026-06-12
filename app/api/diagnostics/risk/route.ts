import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helper";
import { invokeDeepSeekStructured } from "@/lib/deepseek";
import { getPromptLanguage } from "@/lib/locale";
import { buildOllamaNotConfiguredResponse } from "@/lib/local-llm";
import { getUserLanguagePreferences } from "@/lib/user-preferences";

type RiskPayload = {
  age?: number;
  gender?: "Male" | "Female" | "Other";
  severity?: "Low" | "Medium" | "High";
  comorbidities?: string;
  symptoms?: string;
};

type RiskResult = {
  attentionLevel: "Standard Care" | "Monitor Closely" | "High Priority";
  metrics: string[];
  precautions: string[];
};

const riskSchema = {
  type: "object",
  properties: {
    attentionLevel: {
      type: "string",
      enum: ["Standard Care", "Monitor Closely", "High Priority"],
    },
    metrics: {
      type: "array",
      items: { type: "string" },
    },
    precautions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["attentionLevel", "metrics", "precautions"],
  additionalProperties: false,
} as const;

function buildMockRisk(payload: RiskPayload): RiskResult {
  const symptoms = (payload.symptoms ?? "").toLowerCase();
  const comorbidities = (payload.comorbidities ?? "").toLowerCase();
  const age = payload.age ?? 0;

  if (age >= 60 || payload.severity === "High" || /non-healing|cool extremity|absent pulse|shortness of breath|chest pain|confusion/.test(`${symptoms} ${comorbidities}`)) {
    return {
      attentionLevel: "High Priority",
      metrics: [
        "Perform immediate pulse and capillary refill checks",
        "Measure respiratory effort, oxygen saturation, and mental status",
        "Escalate blood pressure and perfusion reassessment frequency",
      ],
      precautions: [
        "Prepare urgent referral if perfusion is poor or symptoms worsen",
        "Avoid delays in vital sign review and local escalation protocols",
        "Keep the patient under close observation until senior review is available",
      ],
    };
  }

  if (age >= 40 || payload.severity === "Medium" || /diabetes|hypertension|asthma|copd|pregnan/.test(`${symptoms} ${comorbidities}`)) {
    return {
      attentionLevel: "Monitor Closely",
      metrics: [
        "Track temperature, pulse, and blood pressure trends",
        "Reassess symptom progression at regular intervals",
        "Monitor hydration, pain score, and functional decline",
      ],
      precautions: [
        "Recheck if symptoms escalate or new red flags appear",
        "Document changes in observation frequency and response",
        "Prepare referral criteria before the next review cycle",
      ],
    };
  }

  return {
    attentionLevel: "Standard Care",
    metrics: [
      "Maintain baseline observations and routine follow-up",
      "Confirm symptom stability during regular visits",
      "Record standard vitals and intake notes",
    ],
    precautions: [
      "Continue ordinary monitoring and educate on warning signs",
      "Reassess if the severity level increases or symptoms change",
      "Escalate only if new urgent findings appear",
    ],
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as RiskPayload;
  try {
    const session = await getSession();
    const preferences = await getUserLanguagePreferences(session?.user);
    const responseLanguage = getPromptLanguage(preferences.chatbotLanguage);
    const result = await invokeDeepSeekStructured<RiskResult>({
      userId: session?.user?.id,
      model: "deepseek-chat",
      temperature: 0.2,
      systemPrompt:
        `You are a triage assistant. Never provide a definitive disease diagnosis or name-based diagnosis. Always write all JSON string values in ${responseLanguage}. Return only JSON with attentionLevel, metrics, and precautions. attentionLevel must be exactly one of: Standard Care, Monitor Closely, High Priority.`,
      userPrompt: JSON.stringify(body),
      schema: riskSchema,
      knowledgeQuery: [body.symptoms, body.comorbidities].filter(Boolean).join(" "),
      knowledgeLimit: 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "OLLAMA_NOT_CONFIGURED") {
      return buildOllamaNotConfiguredResponse();
    }

    return NextResponse.json(buildMockRisk(body));
  }
}
