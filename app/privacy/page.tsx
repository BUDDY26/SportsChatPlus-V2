import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16">
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 1, 2026
        </p>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly (name, email,
              password) when you create an account. We also collect usage data
              (pages visited, features used) to improve the product.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              2. How We Use Your Data
            </h2>
            <p>
              Your data is used to provide and improve SportsChatPlus services,
              personalize your experience, and send important account
              communications. We do not sell your data to third parties.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              3. Data Storage
            </h2>
            <p>
              Data is stored securely in Supabase (PostgreSQL) with row-level
              security policies. All data in transit is encrypted via HTTPS.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-foreground">
              4. Contact
            </h2>
            <p>
              Questions about privacy? Email us at privacy@sportschatplus.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
