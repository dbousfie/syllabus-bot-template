import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  return new Response("Hello from syllabus bot backend", {
    headers: { "content-type": "text/plain" },
  });
});
