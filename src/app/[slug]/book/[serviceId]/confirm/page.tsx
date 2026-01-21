import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConfirmForm } from "@/components/booking/confirm-form";
import { ArrowLeft, Clock, Calendar, Banknote } from "lucide-react";
import { format, parseISO } from "date-fns";

interface PageProps {
  params: Promise<{ slug: string; serviceId: string }>;
  searchParams: Promise<{ date?: string; time?: string; staffId?: string }>;
}

async function getBookingData(slug: string, serviceId: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: {
        where: { id: serviceId },
      },
    },
  });

  if (!business || business.services.length === 0) {
    return null;
  }

  return {
    business,
    service: business.services[0],
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

function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export default async function ConfirmPage({ params, searchParams }: PageProps) {
  const { slug, serviceId } = await params;
  const { date, time, staffId } = await searchParams;

  // Validate required params
  if (!date || !time) {
    redirect(`/${slug}/book/${serviceId}`);
  }

  const data = await getBookingData(slug, serviceId);

  if (!data) {
    notFound();
  }

  const { business, service } = data;
  const parsedDate = parseISO(date);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/${slug}/book/${serviceId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Confirm Your Booking
          </h1>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-900">{service.name}</h2>
                <p className="text-sm text-gray-600">{business.name}</p>
              </div>
              <span className="font-bold text-gray-900">
                {formatPrice(service.price)}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(parsedDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formatTime(time)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-gray-500" />
                <span>{formatDuration(service.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Details
        </h2>
        <ConfirmForm
          businessId={business.id}
          businessSlug={slug}
          serviceId={serviceId}
          date={date}
          time={time}
          staffId={staffId || undefined}
        />
      </main>
    </div>
  );
}
