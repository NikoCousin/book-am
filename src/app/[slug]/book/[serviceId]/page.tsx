import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/booking-form";
import { ArrowLeft, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string; serviceId: string }>;
}

async function getBookingData(slug: string, serviceId: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: {
        where: { id: serviceId, isActive: true },
      },
      staff: {
        where: { isActive: true },
        include: {
          schedules: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!business || business.services.length === 0) {
    return null;
  }

  // Get all schedules from all staff (for now, we'll use the first staff's schedule)
  const schedules = business.staff.flatMap((s) => s.schedules);

  return {
    business,
    service: business.services[0],
    schedules,
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("hy-AM").format(price) + " AMD";
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default async function BookingPage({ params }: PageProps) {
  const { slug, serviceId } = await params;
  const data = await getBookingData(slug, serviceId);

  if (!data) {
    notFound();
  }

  const { business, service, schedules } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {business.name}</span>
          </Link>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{service.name}</h1>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(service.duration)}</span>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Form */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <BookingForm
          businessId={business.id}
          businessSlug={slug}
          service={{
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
          }}
          schedule={schedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          }))}
        />
      </main>
    </div>
  );
}
