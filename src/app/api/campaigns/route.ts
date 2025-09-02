import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      );
    }
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?select=*,posts(count)`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!resp.ok)
      return NextResponse.json(
        { error: await resp.text() },
        { status: resp.status }
      );
    const campaigns = await resp.json();
    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, cover_image_url } = body as {
      name?: string;
      description?: string;
      cover_image_url?: string;
    };
    if (!name)
      return NextResponse.json({ error: "name is required" }, { status: 400 });

    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID; // required to set user_id when using service role
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      );
    }
    if (!ADMIN_USER_ID) {
      return NextResponse.json(
        { error: "ADMIN_USER_ID is not configured on the server" },
        { status: 500 }
      );
    }

    const payload = [
      {
        name,
        description: description ?? null,
        cover_image_url: cover_image_url ?? null,
        user_id: ADMIN_USER_ID,
      },
    ];
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok)
      return NextResponse.json(
        { error: await resp.text() },
        { status: resp.status }
      );
    const data = await resp.json();
    return NextResponse.json({ campaign: data?.[0] ?? null }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
