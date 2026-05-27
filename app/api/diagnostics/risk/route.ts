import { NextResponse } from "next/server";

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

  const prompt = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content:
          "You are a triage assistant. Never provide a definitive disease diagnosis or name-based diagnosis. Return only raw JSON with attentionLevel, metrics, and precautions. attentionLevel must be exactly one of: Standard Care, Monitor Closely, High Priority.",
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
        body: JSON.stringify(prompt),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (typeof content === "string") {
          return NextResponse.json(JSON.parse(content) as RiskResult);
        }
      }
    } catch {
      // Fall back to the local deterministic triage heuristic.
    }
  }

  return NextResponse.json(buildMockRisk(body));
}
