// app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    const { id } = params;

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

    if (!id) {
        return NextResponse.json({
            error: "Post ID is required.",
        }, { status: 400 });
    }

    try {
        // First, verify the post belongs to a campaign owned by the authenticated user
        const verifyResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}&select=campaign_id,campaigns!inner(user_id)`,
            {
                headers: {
                    apikey: SERVICE_ROLE_KEY,
                    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                },
            },
        );

        if (!verifyResponse.ok) {
            return NextResponse.json({ error: "Post not found." }, {
                status: 404,
            });
        }

        const posts = await verifyResponse.json();
        if (!posts || posts.length === 0) {
            return NextResponse.json({
                error: "Post not found or access denied.",
            }, {
                status: 404,
            });
        }

        const post = posts[0];
        if (post.campaigns.user_id !== userId) {
            return NextResponse.json({ error: "Access denied." }, {
                status: 403,
            });
        }

        // Delete the post from the database
        const deleteResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/posts?id=eq.${id}`,
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
                { error: errorData.message || "Failed to delete post" },
                { status: deleteResponse.status },
            );
        }

        return NextResponse.json({ message: "Post deleted successfully" }, {
            status: 200,
        });
    } catch (error: any) {
        console.error("Error deleting post:", error);
        return NextResponse.json({
            error: error.message || "An internal server error occurred.",
        }, { status: 500 });
    }
}
