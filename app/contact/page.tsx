import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the SportsChatPlus team.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-16">
        <h1 className="font-display text-4xl font-bold">Contact Us</h1>
        <p className="mt-4 text-muted-foreground">
          Have a question or feedback? We&apos;d love to hear from you.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
