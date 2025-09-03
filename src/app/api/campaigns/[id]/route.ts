// app/api/campaigns/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

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

  if (!id) {
    return NextResponse.json({
      error: "Campaign ID is required.",
    }, { status: 400 });
  }

  try {
    // Fetch the campaign from the database
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${id}&select=*`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Campaign not found." }, {
        status: 404,
      });
    }

    const campaigns = await response.json();
    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ error: "Campaign not found." }, {
        status: 404,
      });
    }

    const campaign = campaigns[0];

    // Validate that the campaign has required fields
    if (!campaign.name) {
      console.error("Campaign missing required 'name' field:", campaign);
      return NextResponse.json({ error: "Invalid campaign data." }, {
        status: 500,
      });
    }

    return NextResponse.json(campaign, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({
      error: error.message || "An internal server error occurred.",
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

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

  if (!id) {
    return NextResponse.json({
      error: "Campaign ID is required.",
    }, { status: 400 });
  }

  try {
    // First, delete all posts associated with this campaign
    const deletePostsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?campaign_id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!deletePostsResponse.ok) {
      console.warn(
        "Failed to delete associated posts, continuing with campaign deletion",
      );
    }

    // Delete the campaign from the database
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to delete campaign" },
        { status: deleteResponse.status },
      );
    }

    return NextResponse.json({
      message: "Campaign and associated posts deleted successfully",
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({
      error: error.message || "An internal server error occurred.",
    }, { status: 500 });
  }
}
