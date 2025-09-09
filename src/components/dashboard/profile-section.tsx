"use client";

interface ProfileSectionProps {
  isReadOnly?: boolean;
}

export default function ProfileSection({
  isReadOnly = false,
}: ProfileSectionProps) {
  return (
    <div className="mb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-3">
            Welcome To The DG Board
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Where Your Campaigns Come Alive
          </p>
        </div>

        {/* Description Section */}
        <div className="prose prose-lg max-w-none text-center">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-base md:text-lg">
              Every film has a story, and DG Avatar Media - where DG stands for
              Digital Generation - is the BLOCKBUSTER CREW that makes content
              happening, viral and binge-worthy. We're the ones who make sure
              your campaign doesn't just release, IT PREMIERES.
            </p>
            <p className="text-base md:text-lg">
              DG Avatar Media blends media buying, PR, social storytelling,
              star-studded campaigns, AI-solutions, memes, viral trends and most
              importantly, choreographing them into a narrative that will make
              the audiences stop and wonder, helping your brand stay in the
              spotlight. After all, in this world of ever-evolving digital
              landscape, we are the changemakers and the ULTIMATE AVATAR of
              entertainment marketing, making sure your film is remembered long
              after the end-credits roll out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
