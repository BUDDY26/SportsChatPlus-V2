import { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your SportsChatPlus account.",
};

export default function SignupPage() {
  return (
    <div className="dark tournament-rail relative flex min-h-screen items-center justify-center px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-20 select-none pointer-events-none"
        draggable={false}
      />
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-display text-5xl font-bold text-white sm:text-7xl hover:text-white/80 transition-colors">
            SportsChatPlus
          </Link>
          <h1 className="mt-4 text-lg sm:text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of sports fans on SportsChatPlus
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
