import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StaffManagement } from "@/components/dashboard/staff-management";

export default async function StaffPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("business_session");

  if (!session?.value) {
    redirect("/dashboard/login");
  }

  const businessId = session.value;

  // Fetch all staff with schedules and time offs
  const staff = await prisma.staff.findMany({
    where: { businessId },
    include: {
      schedules: {
        where: { isWorking: true },
        orderBy: { dayOfWeek: "asc" },
      },
      timeOffs: {
        orderBy: { startDate: "desc" },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Serialize dates for client component
  const serializedStaff = staff.map((s) => ({
    ...s,
    timeOffs: s.timeOffs.map((to) => ({
      ...to,
      startDate: to.startDate.toISOString(),
      endDate: to.endDate.toISOString(),
    })),
  }));

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        </div>
        <StaffManagement initialStaff={serializedStaff as any} />
      </div>
    </div>
  );
}
