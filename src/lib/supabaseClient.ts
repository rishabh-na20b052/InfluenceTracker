import { createClient } from "@supabase/supabase-js";

// Temporary fix: Use hardcoded values until .env.local is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://qruqdkpnqwkgjrvavaro.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydXFka3BucXdrZ2pydmF2YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTI4NjAsImV4cCI6MjA3MjMyODg2MH0.I2LlxFReMvhBwvPFTq6PJFXfA4m77WursteRF3NGLDc";

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
