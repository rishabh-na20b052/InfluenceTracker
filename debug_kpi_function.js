// Debug script for KPI updater function
// Run with: node debug_kpi_function.js

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function debugFunction() {
  console.log("🔍 Debugging KPI Updater Function...\n");

  // 1. Check current posts in database
  console.log("📊 Current posts in database:");
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, platform, post_url, username, views, likes, comments, shares, last_updated"
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("❌ Error fetching posts:", postsError);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log("ℹ️ No posts found in database");
    return;
  }

  posts.forEach((post, index) => {
    console.log(
      `${index + 1}. ${post.platform.toUpperCase()}: ${post.post_url}`
    );
    console.log(`   ID: ${post.id}`);
    console.log(`   Username: ${post.username || "null"}`);
    console.log(
      `   Metrics: ${post.views} views, ${post.likes} likes, ${
        post.comments
      } comments, ${post.shares || 0} shares`
    );
    console.log(`   Last Updated: ${post.last_updated || "Never"}`);
    console.log("");
  });

  // 2. Check environment variables
  console.log("🔧 Environment Variables Status:");
  const envVars = [
    "X_BEARER_TOKEN",
    "YOUTUBE_API_KEY",
    "APIFY_API_TOKEN",
    "INSTAGRAM_SESSION_ID",
  ];

  envVars.forEach((varName) => {
    const value = process.env[varName];
    const status = value ? "✅ Set" : "❌ Not set";
    console.log(`   ${varName}: ${status}`);
    if (!value) {
      console.log(
        `      ⚠️  This will cause fallback to 0 metrics for ${varName
          .split("_")[0]
          .toLowerCase()}`
      );
    }
  });

  // 3. Test function manually
  console.log("\n🚀 Testing function manually...");
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kpi-updater`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Function executed successfully:", result);
    } else {
      console.log("❌ Function failed with status:", response.status);
      const errorText = await response.text();
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.error("❌ Error calling function:", error);
  }
}

debugFunction().catch(console.error);
