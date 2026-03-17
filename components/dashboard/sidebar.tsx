"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, TrendingUp, MessageSquare, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const controls = [
  { href: "/dashboard/scores",      label: "Live",       icon: Radio },
  { href: "/dashboard/odds",        label: "Odds",       icon: TrendingUp },
  { href: "/dashboard/chat",        label: "Chat",       icon: MessageSquare },
  { href: "/dashboard/ai-insights", label: "AI",         icon: Brain },
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
    <aside className="hidden w-52 flex-shrink-0 flex-col md:flex overflow-hidden">

      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-16 flex-shrink-0 items-center px-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="SportsChatPlus"
          className="h-10 w-auto select-none"
          draggable={false}
        />
      </Link>

      {/* 2×2 Control cluster */}
      <div className="flex-shrink-0 px-2.5 py-2.5">
        <div className="grid grid-cols-2 gap-1">
          {controls.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded px-2 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/[0.07] text-white/60 hover:bg-white/[0.12] hover:text-white"
                )}
              >
                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sports browser */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-2">
        {sportsBrowser.map((group) => (
          <div key={group.label} className="rounded-lg overflow-hidden">
            <p className="px-3 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-[7px] text-[11px] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/80"
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
