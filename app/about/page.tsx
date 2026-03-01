import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about SportsChatPlus.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <h1 className="font-display text-4xl font-bold">About SportsChatPlus</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>
            SportsChatPlus is an all-in-one sports intelligence platform built
            for passionate fans. We combine real-time data, AI-powered analysis,
            and community chat so you can experience sports at a deeper level.
          </p>
          <p>
            Supporting NFL, NBA, MLB, NCAAF, NCAAB (Men &amp; Women), NCAA
            Baseball, and NCAA Softball — we&apos;ve got your leagues covered.
          </p>
          <p>
            Built with Next.js 14, Supabase, and OpenAI, SportsChatPlus is
            designed for speed, reliability, and scale.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
