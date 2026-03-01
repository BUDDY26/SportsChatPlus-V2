"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpAction, type AuthState } from "@/app/(auth)/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Account
    </Button>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<AuthState, FormData>(
    signUpAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat password"
            />
          </div>
          {state.error && (
            <p className="text-xs text-destructive">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
