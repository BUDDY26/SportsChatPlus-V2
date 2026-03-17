"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, TrendingUp, MessageSquare, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const controls = [
  { href: "/dashboard/scores", label: "Live",        icon: Radio },
  { href: "/dashboard/odds",   label: "Odds",        icon: TrendingUp },
  { href: "/dashboard/chat",   label: "Chat",        icon: MessageSquare },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Brain },
];

const sportsBrowser = [
  {
    label: "Football",
    items: [
      { label: "NCAA Football", href: "/dashboard/scores?league=NCAAF" },
      { label: "NFL",           href: "/dashboard/scores?league=NFL" },
    ],
  },
  {
    label: "Basketball",
    items: [
      { label: "NCAA Men's Basketball",   href: "/dashboard/scores?league=NCAAB_MEN" },
      { label: "NCAA Women's Basketball", href: "/dashboard/scores?league=NCAAB_WOMEN" },
      { label: "NBA",                     href: "/dashboard/scores?league=NBA" },
    ],
  },
  {
    label: "Baseball",
    items: [
      { label: "NCAA Baseball", href: "/dashboard/scores?league=NCAA_BASEBALL" },
      { label: "MLB",           href: "/dashboard/scores?league=MLB" },
    ],
  },
  {
    label: "Softball",
    items: [
      { label: "NCAA Softball", href: "/dashboard/scores?league=NCAA_SOFTBALL" },
    ],
  },
  {
    label: "Motorsport",
    items: [
      { label: "F1", href: "/dashboard/scores?league=F1" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-52 flex-shrink-0 border-r border-white/10 bg-[hsl(var(--shell-bg))] text-white md:flex md:flex-col overflow-hidden">

      {/* 2×2 Control cluster */}
      <div className="flex-shrink-0 p-3 border-b border-white/10">
        <div className="grid grid-cols-2 gap-1.5">
          {controls.map((item) => {
            const baseHref = item.href;
            const isActive =
              pathname === baseHref ||
              pathname?.startsWith(baseHref + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                )}
              >
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sports browser */}
      <div className="flex-1 overflow-y-auto py-1">
        {sportsBrowser.map((group) => (
          <div key={group.label} className="mb-0.5">
            <p className="px-3 pt-2.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

    </aside>
  );
}
