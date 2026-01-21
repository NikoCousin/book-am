import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingList } from "@/components/dashboard/booking-list";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("business_session");

  if (!session?.value) {
    redirect("/dashboard/login");
  }

  const businessId = session.value;

  // Fetch business schedule (through staff)
  const schedule = await prisma.schedule.findMany({
    where: {
      staff: {
        businessId,
      },
    },
    select: {
      dayOfWeek: true,
      startTime: true,
      endTime: true,
    },
  });

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl">
        <BookingList businessId={businessId} schedule={schedule} />
      </div>
    </div>
  );
}
