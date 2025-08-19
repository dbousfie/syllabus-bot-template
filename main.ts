import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const QUALTRICS_API_TOKEN = Deno.env.get("QUALTRICS_API_TOKEN");
const QUALTRICS_SURVEY_ID = Deno.env.get("QUALTRICS_SURVEY_ID");
const QUALTRICS_DATACENTER = Deno.env.get("QUALTRICS_DATACENTER");
const SYLLABUS_LINK = Deno.env.get("SYLLABUS_LINK") || "";

// easy knobs to turn
const MAX_QUERY_LENGTH = 40000;       // allow long essays; trim pathological inputs
const MAX_RESPONSE_TOKENS = 1500;     // cap model output length
const MAX_REQS_PER_MINUTE = 60;       // per-IP rate limit

// per-IP sliding window limiter (1 minute)
const hits = new Map<string, number[]>();
function limited(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "x";
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_REQS_PER_MINUTE;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (limited(req)) {
    return new Response("Too many requests, please try again in a minute.", {
      status: 429,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: { query: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return new Response("Missing OpenAI API key", { status: 500 });
  }

  // enforce query length limit
  let query = (body.query || "").trim();
  if (query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH);
  }

  const syllabus = await Deno.readTextFile("syllabus.md").catch(() =>
    "Error loading syllabus."
  );

  const messages = [
    {
      role: "system",
      content: "You are an accurate assistant. Always include a source URL if possible."
    },
    {
      role: "system",
      content: `Here is important context from syllabus.md:\n${syllabus}`,
    },
    {
      role: "user",
      content: query,
    },
  ];

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: MAX_RESPONSE_TOKENS,
    }),
  });

  const openaiJson = await openaiResponse.json();
  const baseResponse = openaiJson?.choices?.[0]?.message?.content || "No response from OpenAI";
  const result = `${baseResponse}\n\nThere may be errors in my responses; always refer to the course web page: ${SYLLABUS_LINK}`;

  let qualtricsStatus = "Qualtrics not called";

  if (QUALTRICS_API_TOKEN && QUALTRICS_SURVEY_ID && QUALTRICS_DATACENTER) {
    const qualtricsPayload = {
      values: {
        responseText: result,
        queryText: query,
      },
    };

    const qt = await fetch(
      `https://${QUALTRRICS_DATACENTER}.qualtrics.com/API/v3/surveys/${QUALTRICS_SURVEY_ID}/responses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-TOKEN": QUALTRICS_API_TOKEN,
        },
        body: JSON.stringify(qualtricsPayload),
      },
    );

    qualtricsStatus = `Qualtrics status: ${qt.status}`;
  }

  return new Response(`${result}\n<!-- ${qualtricsStatus} -->`, {
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
