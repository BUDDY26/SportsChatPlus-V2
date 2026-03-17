import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

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
    <div className="flex h-screen flex-col overflow-hidden bg-[hsl(var(--shell-bg))]">
      <DashboardNavbar session={session} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="relative flex-1 overflow-hidden bg-[url('/images/dashboard-bg.png')] bg-cover bg-center bg-no-repeat">
          {children}
        </main>
      </div>
    </div>
  );
}
