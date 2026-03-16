"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  LayoutDashboard,
  MessageSquare,
  Star,
  User,
  Brain,
  TrendingUp,
  Brackets,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/scores", label: "Live Scores", icon: Trophy },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/dashboard/odds", label: "Odds", icon: TrendingUp },
  { href: "/dashboard/tournament", label: "Tournament Center", icon: Brackets },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-white/10 bg-[hsl(var(--shell-bg))] text-white md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <span className="font-display font-bold">SportsChatPlus</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link",
                isActive && "sidebar-link-active"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
