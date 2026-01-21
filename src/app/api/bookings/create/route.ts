import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseISO, addMinutes, format } from "date-fns";

const bookingSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().min(1),
  customerPhone: z.string().regex(/^\+374\d{8}$/),
  customerEmail: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Verify business and service exist
    const service = await prisma.service.findFirst({
      where: {
        id: data.serviceId,
        businessId: data.businessId,
        isActive: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get first active staff member for this business
    const staff = await prisma.staff.findFirst({
      where: {
        businessId: data.businessId,
        isActive: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "No staff available" },
        { status: 400 }
      );
    }

    // Check if time slot is still available
    const bookingDate = parseISO(data.date);
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId: data.businessId,
        date: bookingDate,
        startTime: data.time,
        status: {
          in: ["pending", "confirmed"],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Calculate end time based on service duration
    const [hours, minutes] = data.time.split(":").map(Number);
    const startDateTime = new Date(bookingDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    const endDateTime = addMinutes(startDateTime, service.duration);
    const endTime = format(endDateTime, "HH:mm");

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: data.customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: data.customerPhone,
          name: data.customerName,
          email: data.customerEmail || null,
        },
      });
    } else {
      // Update customer info if they already exist
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.customerName,
          email: data.customerEmail || customer.email,
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId: data.businessId,
        staffId: staff.id,
        serviceId: data.serviceId,
        customerId: customer.id,
        date: bookingDate,
        startTime: data.time,
        endTime: endTime,
        status: "confirmed",
        notes: data.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
