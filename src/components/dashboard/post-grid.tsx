import type { Post } from '@/lib/types';
import PostCard from './post-card';

type PostGridProps = {
  posts: Post[];
};

export default function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-96">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">No Posts Found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or adding a new post.
            </p>
          </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
