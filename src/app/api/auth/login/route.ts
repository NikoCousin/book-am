import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { phone, action } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Find business by phone
    const business = await prisma.business.findFirst({
      where: { phone },
    });

    if (!business) {
      return NextResponse.json(
        { error: "No business found with this phone number" },
        { status: 404 }
      );
    }

    if (action === "send-code") {
      // In production, we would send SMS here
      // For now, just confirm business exists
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set("business_session", business.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
