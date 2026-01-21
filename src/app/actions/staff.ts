"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(), // Keep as imageUrl in API, map to avatar in DB
  isActive: z.boolean().default(true),
});

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const timeOffSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().nullable().optional(),
});

async function getBusinessId(): Promise<string> {
  const cookieStore = await cookies();
  const session = cookieStore.get("business_session");
  if (!session?.value) {
    throw new Error("Unauthorized");
  }
  return session.value;
}

export async function createStaff(data: z.infer<typeof staffSchema>) {
  try {
    const businessId = await getBusinessId();
    const validated = staffSchema.parse(data);

    const staff = await prisma.staff.create({
      data: {
        businessId,
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        avatar: validated.imageUrl || null, // Map imageUrl to avatar field
        isActive: validated.isActive,
      },
    });

    revalidatePath("/dashboard/settings/staff");
    return { success: true, staff };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Create staff error:", error);
    return { success: false, error: "Failed to create staff member" };
  }
}

export async function updateStaff(
  id: string,
  data: z.infer<typeof staffSchema>
) {
  try {
    const businessId = await getBusinessId();
    const validated = staffSchema.parse(data);

    // Verify staff belongs to this business
    const existingStaff = await prisma.staff.findFirst({
      where: { id, businessId },
    });

    if (!existingStaff) {
      return { success: false, error: "Staff member not found" };
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        name: validated.name,
        email: validated.email || null,
        phone: validated.phone || null,
        avatar: validated.imageUrl || null, // Map imageUrl to avatar field
        isActive: validated.isActive,
      },
    });

    revalidatePath("/dashboard/settings/staff");
    return { success: true, staff };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Update staff error:", error);
    return { success: false, error: "Failed to update staff member" };
  }
}

export async function updateStaffSchedule(
  staffId: string,
  schedules: z.infer<typeof scheduleSchema>[]
) {
  try {
    const businessId = await getBusinessId();

    // Verify staff belongs to this business
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, businessId },
    });

    if (!staff) {
      return { success: false, error: "Staff member not found" };
    }

    // Validate all schedules
    const validatedSchedules = schedules.map((s) => scheduleSchema.parse(s));

    // Use transaction to replace all schedules
    await prisma.$transaction(async (tx) => {
      // Delete existing schedules
      await tx.schedule.deleteMany({
        where: { staffId },
      });

      // Create new schedules
      if (validatedSchedules.length > 0) {
        await tx.schedule.createMany({
          data: validatedSchedules.map((s) => ({
            staffId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isWorking: true,
          })),
        });
      }
    });

    revalidatePath("/dashboard/settings/staff");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Update schedule error:", error);
    return { success: false, error: "Failed to update schedule" };
  }
}

export async function addTimeOff(
  staffId: string,
  data: z.infer<typeof timeOffSchema>
) {
  try {
    const businessId = await getBusinessId();

    // Verify staff belongs to this business
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, businessId },
    });

    if (!staff) {
      return { success: false, error: "Staff member not found" };
    }

    const validated = timeOffSchema.parse(data);

    const timeOff = await prisma.timeOff.create({
      data: {
        staffId,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        reason: validated.reason || null,
      },
    });

    revalidatePath("/dashboard/settings/staff");
    return { success: true, timeOff };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Add time off error:", error);
    return { success: false, error: "Failed to add time off" };
  }
}

export async function deleteTimeOff(timeOffId: string) {
  try {
    const businessId = await getBusinessId();

    // Verify time off belongs to staff in this business
    const timeOff = await prisma.timeOff.findFirst({
      where: {
        id: timeOffId,
        staff: {
          businessId,
        },
      },
    });

    if (!timeOff) {
      return { success: false, error: "Time off not found" };
    }

    await prisma.timeOff.delete({
      where: { id: timeOffId },
    });

    revalidatePath("/dashboard/settings/staff");
    return { success: true };
  } catch (error) {
    console.error("Delete time off error:", error);
    return { success: false, error: "Failed to delete time off" };
  }
}
