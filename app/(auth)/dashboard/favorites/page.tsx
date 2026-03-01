import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FavoritesClient } from "@/components/favorites/FavoritesClient";

export const metadata: Metadata = { title: "My Favorites" };

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">My Favorites</h1>
        <p className="mt-1 text-muted-foreground">
          Your favorite teams and players — with personalized alerts.
        </p>
      </div>
      <FavoritesClient userId={session?.user?.id ?? ""} />
    </div>
  );
}
