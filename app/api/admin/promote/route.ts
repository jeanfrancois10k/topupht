import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // empty body fallback
    }

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    );

    const userId = body.userId;
    const email = body.email;

    if (!userId && !email) {
      return NextResponse.json({ error: "Utilisateur non identifié" }, { status: 400 });
    }

    let query = supabaseAdmin.from("profiles").update({ role: "SUPER_ADMIN" } as any);
    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", email);
    }

    const { error: updateError } = await query;

    if (updateError) {
      console.error("Promote update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: "SUPER_ADMIN" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
