import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBusiness(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      staff: {
        where: { isActive: true },
      },
    },
  });

  return business;
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

function getBusinessTypeLabel(type: string) {
  const labels: Record<string, string> = {
    barber: "Barbershop",
    salon: "Salon",
    spa: "Spa",
  };
  return labels[type] || type;
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getBusiness(slug);

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Scissors className="w-8 h-8 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            {getBusinessTypeLabel(business.type)}
          </p>

          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {business.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <a href={`tel:${business.phone}`} className="hover:underline">
                  {business.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Services */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>

        <div className="space-y-3">
          {business.services.map((service) => (
            <Link
              key={service.id}
              href={`/${slug}/book/${service.id}`}
              className="block w-full bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-gray-900 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-900">{formatPrice(service.price)}</span>
              </div>
            </Link>
          ))}
        </div>

        {business.services.length === 0 && (
          <p className="text-gray-600 text-center py-8">
            No services available at this time.
          </p>
        )}
      </main>
    </div>
  );
}
