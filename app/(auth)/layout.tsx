import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users away from login/signup
  // Dashboard routes are nested separately — this layout handles the auth shell
  return <>{children}</>;
}
