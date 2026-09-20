import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { jsonHeaders } from "./cors.ts";

export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function requireAuthenticatedUser(
  req: Request,
  supabase: SupabaseClient
): Promise<{ user: { id: string; email?: string } } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  return { user };
}
