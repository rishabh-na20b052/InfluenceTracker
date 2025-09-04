"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import UserMenu from "@/components/user-menu";

export default function Header() {
  // Check if we're in readonly mode
  const isReadOnly =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "readonly";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <Link href="/" className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          Codeit influencer Tracker
        </h1>
      </Link>

      {!isReadOnly && (
        <div className="ml-auto">
          <UserMenu />
        </div>
      )}
    </header>
  );
}
