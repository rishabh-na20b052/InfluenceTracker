"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/user-menu";

export default function Header() {
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const view = new URLSearchParams(window.location.search).get("view");
      setIsReadOnly(view === "readonly");
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/assets/logoBlack.png"
          alt="DG Avatar Media"
          width={100}
          height={100}
          priority
          className="object-contain"
        />
      </Link>

      {/* User Menu (hidden in readonly mode) */}
      {!isReadOnly && (
        <div className="ml-auto">
          <UserMenu />
        </div>
      )}
    </header>
  );
}
