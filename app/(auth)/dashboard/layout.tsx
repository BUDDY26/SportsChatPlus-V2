import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dark min-h-screen flex flex-col tournament-rail">
      <DashboardNavbar session={session} />
      <div className="flex flex-1 min-h-0">
        <DashboardSidebar />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </main>
      </div>
    </div>
  );
}
