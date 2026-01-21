import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCalendarButton } from "@/components/booking/add-to-calendar-button";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Scissors,
} from "lucide-react";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ slug: string; serviceId: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}

async function getBookingDetails(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      business: true,
      service: true,
      staff: true,
    },
  });

  return booking;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("hy-AM").format(price) + " AMD";
}

function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export default async function SuccessPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { bookingId } = await searchParams;

  if (!bookingId) {
    notFound();
  }

  const booking = await getBookingDetails(bookingId);

  if (!booking || booking.business.slug !== slug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">
            Your appointment has been successfully booked.
          </p>
        </div>
      </header>

      {/* Booking Details */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Service Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-1">
              <Scissors className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">
                {booking.service.name}
              </h2>
            </div>
            <p className="text-gray-600 ml-8">{formatPrice(booking.service.price)}</p>
          </div>

          {/* Date & Time */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">
                {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
          </div>

          {/* Business Info */}
          <div className="p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              {booking.business.name}
            </h3>
            {booking.business.address && (
              <div className="flex items-center gap-3 text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{booking.business.address}</span>
              </div>
            )}
            {booking.business.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-4 h-4 text-gray-500" />
                <a
                  href={`tel:${booking.business.phone}`}
                  className="hover:underline"
                >
                  {booking.business.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Booking Reference */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Booking Reference</p>
          <p className="font-mono text-gray-900">{booking.id}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <AddToCalendarButton />

          <Link
            href={`/${slug}`}
            className="block w-full py-3 px-4 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all text-center"
          >
            Back to {booking.business.name}
          </Link>
        </div>

        {/* Note */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          A confirmation has been sent to {booking.customerPhone}
        </p>
      </main>
    </div>
  );
}
