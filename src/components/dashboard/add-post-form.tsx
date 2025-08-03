'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export default function AddPostForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would submit the URL to the backend for processing.
    // For now, it will just log to console.
    const url = (e.currentTarget.elements.namedItem('post-url') as HTMLInputElement).value;
    console.log('Submitting URL:', url);
    e.currentTarget.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Track New Post</CardTitle>
        <CardDescription>
          Submit a post URL from Instagram, YouTube, or Twitter/X.
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
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Track Post
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
