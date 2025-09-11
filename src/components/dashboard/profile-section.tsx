"use client";

import Image from "next/image";

interface ProfileSectionProps {
  isReadOnly?: boolean;
}

export default function ProfileSection({
  isReadOnly = false,
}: ProfileSectionProps) {
  return (
    <div className="mb-12">
      <div className="grid md:grid-cols-3 gap-8 items-center">
        {/* Profile Image */}
        <div className="md:col-span-1 flex justify-center">
          <div className="relative">
            <Image
              src="/assets/logoBlack.png"
              alt="DG Avatar Media"
              width={400}
              height={400}
              className="rounded-full object-contain w-64 h-64 border-4 border-primary/20 shadow-2xl bg-white"
              priority
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-2">
              Welcome To The DG Board
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Where Your Campaigns Come Alive
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Every film has a story, and DG Avatar Media - where DG stands for
              Digital Generation - is the BLOCKBUSTER CREW that makes content
              happening, viral and binge-worthy. We're the ones who make sure
              your campaign doesn't just release, IT PREMIERES.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
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
