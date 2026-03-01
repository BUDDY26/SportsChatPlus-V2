import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">SportsChatPlus</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SportsChatPlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
