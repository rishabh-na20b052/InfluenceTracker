"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { AuthProvider } from "./auth-context";

interface ConditionalAuthProviderProps {
  children: React.ReactNode;
}

export function ConditionalAuthProvider({
  children,
}: ConditionalAuthProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if this is a shared link (readonly mode)
  const isSharedLink = searchParams.get("view") === "readonly";

  // Check if this is an auth page
  const isAuthPage = pathname.startsWith("/auth/");

  // Only provide auth context for authenticated pages, not for shared links or auth pages
  if (isSharedLink || isAuthPage) {
    return <>{children}</>;
  }

  // For all other pages, provide the auth context
  return <AuthProvider>{children}</AuthProvider>;
}
