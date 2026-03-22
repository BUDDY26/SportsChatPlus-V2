"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { LogOut, User } from "lucide-react";
import Link from "next/link";

interface DashboardNavbarProps {
  session: Session;
}

export function DashboardNavbar({ session }: DashboardNavbarProps) {
  const user = session.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <header className="flex h-9 flex-shrink-0 items-center border-b border-white/[0.06] px-4">

      {/* Left: width spacer aligns with sidebar */}
      <div className="hidden md:block w-52 flex-shrink-0" />

      {/* Center: minimal utility link */}
      <div className="flex flex-1 items-center justify-center">
        <Link
          href="/dashboard/support"
          className="text-[11px] tracking-wide text-on-surface-variant/30 transition-colors hover:text-on-surface-variant/70"
        >
          Support
        </Link>
      </div>

      {/* Right: theme toggle + avatar */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-7 w-7 rounded-full p-0">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-on-surface-variant/60">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  );
}
