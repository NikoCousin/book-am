import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");
  const dateStr = searchParams.get("date");
  const staffId = searchParams.get("staffId"); // Optional: filter by specific staff member

  if (!businessId || !dateStr) {
    return NextResponse.json(
      { error: "businessId and date are required" },
      { status: 400 }
    );
  }

  const date = new Date(dateStr);

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      ...(staffId && { staffId }), // If staffId provided, filter by that staff member
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: {
        in: ["pending", "confirmed"],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const bookedSlots = bookings.map((b) => b.startTime);

  return NextResponse.json({ bookedSlots });
}
