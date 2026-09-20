import { jsonHeaders } from "./cors.ts";

export function errorResponse(error: unknown, status = 500): Response {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return new Response(JSON.stringify({ error: message }), { status, headers: jsonHeaders });
}
