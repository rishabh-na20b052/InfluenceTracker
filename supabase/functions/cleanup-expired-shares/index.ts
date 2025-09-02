/// <reference lib="deno.ns" />

import { createClient } from "supabase";

interface CampaignShare {
  id: string;
  campaign_id: string;
  expires_at: string;
}

Deno.serve(async (req) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting cleanup of expired campaign shares...");

    // Get current timestamp
    const now = new Date().toISOString();

    // Find expired shares
    const { data: expiredShares, error: selectError } = await supabase
      .from("campaign_shares")
      .select("id, campaign_id, expires_at")
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (selectError) {
      console.error("Error fetching expired shares:", selectError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch expired shares" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!expiredShares || expiredShares.length === 0) {
      console.log("No expired shares found");
      return new Response(
        JSON.stringify({
          message: "No expired shares to clean up",
          cleaned: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredShares.length} expired shares to clean up`);

    // Delete expired shares
    const shareIds = expiredShares.map((share) => share.id);
    const { error: deleteError } = await supabase
      .from("campaign_shares")
      .delete()
      .in("id", shareIds);

    if (deleteError) {
      console.error("Error deleting expired shares:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete expired shares" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `Successfully cleaned up ${expiredShares.length} expired shares`
    );

    return new Response(
      JSON.stringify({
        message: "Cleanup completed successfully",
        cleaned: expiredShares.length,
        shares: expiredShares.map((s) => ({
          id: s.id,
          campaign_id: s.campaign_id,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
