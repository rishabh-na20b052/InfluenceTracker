import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function getUserId(request: NextRequest): Promise<string | null> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return user.id;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}
