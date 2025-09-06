import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 },
      );
    }

    // First, verify the campaign exists (company-wide access)
    const campaignCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${id}&select=id`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!campaignCheck.ok) {
      return NextResponse.json({ error: "Campaign not found." }, {
        status: 404,
      });
    }

    const campaigns = await campaignCheck.json();
    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        error: "Campaign not found or access denied.",
      }, {
        status: 404,
      });
    }

    // Fetch posts for the campaign
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?campaign_id=eq.${id}&order=created_at.desc`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 },
      );
    }

    const posts = await response.json();

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
