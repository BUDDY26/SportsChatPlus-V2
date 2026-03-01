import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 1, 2026
        </p>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing SportsChatPlus, you agree to these Terms of Service.
              If you do not agree, do not use the platform.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              2. User Conduct
            </h2>
            <p>
              Users must not post hateful, abusive, or illegal content in the
              community chat. Violations may result in account suspension.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              3. Odds &amp; Gambling Disclaimer
            </h2>
            <p>
              Odds displayed are for informational purposes only.
              SportsChatPlus is not a sportsbook and does not accept bets.
              Always gamble responsibly and check local laws.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              4. Limitation of Liability
            </h2>
            <p>
              SportsChatPlus is provided &quot;as is&quot; without warranties.
              We are not liable for inaccurate scores or odds data.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
