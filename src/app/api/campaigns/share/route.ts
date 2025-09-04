import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { campaignId, expiresAt } = await req.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 },
      );
    }

    // Create authenticated Supabase client
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify the user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or access denied" },
        { status: 404 },
      );
    }

    // Create share record using the authenticated user
    const { data: shareData, error: shareError } = await supabase
      .from("campaign_shares")
      .insert({
        campaign_id: campaignId,
        user_id: user.id,
        expires_at: expiresAt || null,
      })
      .select("id")
      .single();

    if (shareError) {
      console.error("Share creation error:", shareError);
      return NextResponse.json(
        { error: "Failed to create share link" },
        { status: 500 },
      );
    }

    if (!shareData?.id) {
      return NextResponse.json(
        { error: "Failed to get share ID" },
        { status: 500 },
      );
    }

    return NextResponse.json({ shareId: shareData.id }, { status: 201 });
  } catch (error) {
    console.error("Share creation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
