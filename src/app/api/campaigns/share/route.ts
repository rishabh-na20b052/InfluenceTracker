import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { campaignId, expiresAt } = await req.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      );
    }

    if (!ADMIN_USER_ID) {
      return NextResponse.json(
        { error: "ADMIN_USER_ID is not configured" },
        { status: 500 }
      );
    }

    // Create share record directly
    const shareData = {
      campaign_id: campaignId,
      user_id: ADMIN_USER_ID,
      expires_at: expiresAt || null,
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/campaign_shares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(shareData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Share creation error:", errorText);
      return NextResponse.json(
        { error: "Failed to create share link" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const shareId = result[0]?.id;

    if (!shareId) {
      return NextResponse.json(
        { error: "Failed to get share ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({ shareId }, { status: 201 });
  } catch (error) {
    console.error("Share creation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
