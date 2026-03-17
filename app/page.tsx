import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  Trophy,
  MessageSquare,
  Brain,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Live Scores",
    description: "Real-time scores across NFL, NBA, MLB, NCAAF, NCAAB, and more.",
  },
  {
    icon: MessageSquare,
    title: "Community Chat",
    description: "Talk live with other fans during games.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description: "GPT-powered game analysis, player breakdowns, and predictive commentary.",
  },
  {
    icon: TrendingUp,
    title: "Betting Odds",
    description: "Live odds from top sportsbooks updated in real time.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Never miss a big play, score change, or game result.",
  },
  {
    icon: Shield,
    title: "Multi-League",
    description: "All your leagues in one place. NFL, NBA, MLB, NCAA and more.",
  },
];

const leagues = ["NFL", "NBA", "MLB", "NCAAF", "NCAAB", "NCAA Baseball", "NCAA Softball"];

export default function HomePage() {
  return (
    <div className="dark tournament-rail flex min-h-screen flex-col">

      {/* ── Section 1: Hero ────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">

        {/* Hero background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30 select-none"
          draggable={false}
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center gap-6">

          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/UPDATE_LOGO.png"
            alt="SportsChatPlus"
            className="h-16 w-auto select-none"
            draggable={false}
          />

          {/* Badge */}
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/50">
            Now in Beta
          </span>

          {/* Headline */}
          <h1 className="font-display text-5xl font-bold text-white sm:text-7xl">
            SportsChatPlus
          </h1>

          {/* Tagline */}
          <p className="font-display text-xl font-semibold text-primary sm:text-2xl">
            Sports Intelligence, Supercharged
          </p>

          {/* Description */}
          <p className="max-w-2xl text-base text-white/60">
            Real-time scores, AI-powered insights, community chat, and live odds
            — all in one fast, beautiful dashboard.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-8 py-3 font-bold text-black transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-primary/40 px-8 py-3 text-primary transition-colors hover:border-primary/70"
            >
              Sign In
            </Link>
          </div>

          {/* League pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {leagues.map((league) => (
              <span
                key={league}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/50"
              >
                {league}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── Section 2: Features Grid ───────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-white sm:text-4xl">
            Everything You Need
          </h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card-float rounded-xl p-6">
                <feature.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-display text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: CTA Banner ──────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="card-float mx-auto max-w-2xl rounded-xl p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Level Up?
          </h2>
          <p className="mt-4 text-white/60">
            Join thousands of fans getting smarter about sports.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 font-bold text-black transition-opacity hover:opacity-90"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Section 4: Footer ─────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
