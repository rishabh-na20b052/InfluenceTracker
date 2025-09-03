// components/AddPostForm.tsx (Corrected and Final Version for Step 2)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the shape of the newly created post that our API will return.
// This should match the columns in your Supabase 'posts' table.
interface NewPost {
  id: string;
  campaign_id: string;
  post_url: string;
  platform: "instagram" | "youtube" | "x";
  // other fields like views, likes, etc. will have their default values
}

type AddPostFormProps = {
  campaignId: string;
  onPostAdded?: (newPost?: NewPost) => void;
};

export default function AddPostForm({
  campaignId,
  onPostAdded,
}: AddPostFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting post URL:", url, "for campaign:", campaignId);

      // Securely call our backend API route
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaignId,
          postUrl: url,
        }),
      });

      console.log("API response status:", response.status);
      const result = await response.json();
      console.log("API response data:", result);

      if (!response.ok) {
        // Our API route provides a clean error message in the 'error' field
        throw new Error(result.error || "An unknown error occurred.");
      }

      toast({
        title: "Post Added!",
        description:
          "The new post is now being tracked and its stats will be updated soon.",
      });

      // Pass the complete new post object back to the parent page.
      // This allows the UI to update instantly without a full page refresh.
      onPostAdded?.(result as NewPost);
      setUrl(""); // Reset the form input
    } catch (error: any) {
      console.error("Error adding post:", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Post",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Track New Post</CardTitle>
        <CardDescription>
          Submit a post URL from Instagram, YouTube, or X.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="post-url">Post URL</Label>
            <Input
              id="post-url"
              name="post-url"
              placeholder="https://platform.com/post/..."
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={loading || !url}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            {loading ? "Tracking..." : "Track Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
