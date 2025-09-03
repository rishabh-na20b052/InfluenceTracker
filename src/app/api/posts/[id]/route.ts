// app/api/posts/[id]/route.ts

import { NextResponse } from "next/server";

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
            error: "Post ID is required.",
        }, { status: 400 });
    }

    try {
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
