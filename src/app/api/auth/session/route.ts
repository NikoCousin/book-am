import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("business_session");

    if (!session?.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: session.value },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        type: true,
      },
    });

    if (!business) {
      // Invalid session, clear cookie
      cookieStore.delete("business_session");
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      business,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 500 }
    );
  }
}
