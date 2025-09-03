// components/Header.tsx (Updated)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [adminUser, setAdminUser] = useState<{
    email: string;
    id: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // If no authenticated user, use admin user
      if (!user) {
        setAdminUser({
          email: "admin@codeit.com",
          id: "57c81682-2cd9-45ea-8b81-9521665f588e",
        });
      }
    };

    fetchUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // After signing out, Supabase client clears the session.
    // Redirect the user to the login page.
    router.push("/login");
  };

  // Function to get the initial for the AvatarFallback
  const getInitial = (email: string | undefined) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  const displayUser = user || adminUser;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-8">
      <Link href="/" className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          Codeit influencer Tracker
        </h1>
      </Link>

      {/* Show the dropdown for authenticated user or admin user */}
      {displayUser && (
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* In the future, you can use a user's avatar_url from a profiles table */}
                  <AvatarImage src="/user.png" alt={displayUser.email} />
                  <AvatarFallback>
                    {getInitial(displayUser.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* This can link to a future profile settings page */}
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />

              {/* The Log out item is now a button that triggers the handleLogout function */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
