// trigger redeploy

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const handler = async (req: Request): Promise<Response> => {
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

  const syllabus = await Deno.readTextFile("syllabus.txt").catch(() =>
    "Error loading syllabus."
  );

  const messages = [
    {
      role: "system",
      content:
        "You are an accurate assistant. Always include a source URL if possible. End with: 'there may be errors in my responses; always refer to the course web page.'",
    },
    {
      role: "system",
      content: `Here is important context from syllabus.txt:\n${syllabus}`,
    },
    {
      role: "user",
      content: body.query,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
    }),
  });

  const json = await response.json();

  const result =
    json?.choices?.[0]?.message?.content || "No response from OpenAI";

  return new Response(result, {
    headers: { "Content-Type": "text/plain" },
  });
};

serve(handler);
