import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { shareId, campaignId } = await req.json();

    if (!shareId || !campaignId) {
      return NextResponse.json(
        { error: "Share ID and Campaign ID are required" },
        { status: 400 }
      );
    }

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

    // Query the campaign_shares table to validate the share
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/campaign_shares?id=eq.${encodeURIComponent(
        shareId
      )}&campaign_id=eq.${encodeURIComponent(campaignId)}`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to validate share link" },
        { status: 500 }
      );
    }

    const shares = await response.json();

    if (!shares || shares.length === 0) {
      return NextResponse.json(
        { error: "Share link not found or invalid" },
        { status: 404 }
      );
    }

    const share = shares[0];

    // Check if share has expired
    if (share.expires_at) {
      const expiryDate = new Date(share.expires_at);
      const now = new Date();

      if (now > expiryDate) {
        // Share has expired, delete it
        await fetch(
          `${SUPABASE_URL}/rest/v1/campaign_shares?id=eq.${encodeURIComponent(
            shareId
          )}`,
          {
            method: "DELETE",
            headers: {
              apikey: SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
          }
        );

        return NextResponse.json(
          { error: "This share link has expired" },
          { status: 410 } // 410 Gone
        );
      }
    }

    // Share is valid
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Share validation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
