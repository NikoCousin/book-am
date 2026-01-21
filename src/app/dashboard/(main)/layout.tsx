import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("business_session");

  if (!session?.value) {
    redirect("/dashboard/login");
  }

  const business = await prisma.business.findUnique({
    where: { id: session.value },
    select: { name: true },
  });

  if (!business) {
    redirect("/dashboard/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar businessName={business.name} />

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
