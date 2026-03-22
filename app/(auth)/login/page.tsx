import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SportsChatPlus account.",
};

export default function LoginPage() {
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
          <h1 className="mt-4 text-lg sm:text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
