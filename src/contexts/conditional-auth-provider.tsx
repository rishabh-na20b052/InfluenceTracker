"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AuthProvider } from "./auth-context";
import { Suspense } from "react";

interface ConditionalAuthProviderProps {
  children: React.ReactNode;
}

function ConditionalAuthProviderContent({
  children,
}: ConditionalAuthProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if this is a shared link (readonly mode)
  const isSharedLink = searchParams.get("view") === "readonly";

  // Only exclude auth context for shared links (readonly mode)
  // Auth pages need the auth context to function properly
  if (isSharedLink) {
    return <>{children}</>;
  }

  // For all other pages (including auth pages), provide the auth context
  return <AuthProvider>{children}</AuthProvider>;
}

export function ConditionalAuthProvider({
  children,
}: ConditionalAuthProviderProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConditionalAuthProviderContent>
        {children}
      </ConditionalAuthProviderContent>
    </Suspense>
  );
}
