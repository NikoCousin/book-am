import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get("business_session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const businessId = session.value;
    const { id } = await params;
    const body = await request.json();

    // Check booking belongs to this business
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Handle reschedule
    if (body.reschedule) {
      const { date, time } = body;

      if (!date || !time) {
        return NextResponse.json(
          { error: "Date and time are required for rescheduling" },
          { status: 400 }
        );
      }

      // Calculate new end time based on service duration
      const [hours, minutes] = time.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + booking.service.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          date: new Date(date),
          startTime: time,
          endTime,
          status: "rescheduled",
        },
      });

      return NextResponse.json({ booking: updatedBooking });
    }

    // Handle status change
    const { status } = body;
    const validStatuses = ["pending", "confirmed", "completed", "cancelled", "no-show", "rescheduled"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
