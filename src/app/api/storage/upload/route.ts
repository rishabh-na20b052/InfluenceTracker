import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
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

    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/campaign-covers/${fileName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": file.type,
        },
        body: fileBuffer,
      },
    );

    if (!uploadResponse.ok) {
      // If bucket doesn't exist, create it first
      const createBucketResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/bucket`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "campaign-covers",
            name: "campaign-covers",
            public: true,
          }),
        },
      );

      if (createBucketResponse.ok) {
        // Retry upload after creating bucket
        const retryUploadResponse = await fetch(
          `${SUPABASE_URL}/storage/v1/object/campaign-covers/${fileName}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              "Content-Type": file.type,
            },
            body: fileBuffer,
          },
        );

        if (!retryUploadResponse.ok) {
          return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "Failed to create storage bucket" },
          { status: 500 },
        );
      }
    }

    // Return the public URL
    const publicUrl =
      `${SUPABASE_URL}/storage/v1/object/public/campaign-covers/${fileName}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
