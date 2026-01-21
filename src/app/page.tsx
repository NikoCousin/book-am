import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Scissors, Search, MapPin, ArrowRight } from "lucide-react";

async function getAllBusinesses() {
  const businesses = await prisma.business.findMany({
    include: {
      services: {
        orderBy: { price: "asc" },
        take: 1, // Just get the first service for the "Book Service" button
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return businesses;
}

function getBusinessTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    barber: "Barbershop",
    salon: "Salon",
    spa: "Spa",
  };
  return labels[type] || type;
}

export default async function Home() {
  const businesses = await getAllBusinesses();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scissors className="w-10 h-10 text-gray-900" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Book.am
              </h1>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Book your next haircut in seconds.
            </h2>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The best barbers and salons in Armenia
            </p>

            {/* Search Bar (Visual Only) */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Find a salon..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Search functionality coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {businesses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Scissors className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We're working on bringing the best barbers and salons to you. Check back soon!
            </p>
            <Link href="/dashboard/login">
              <Button size="lg">
                Register Your Business
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Available Businesses
              </h3>
              <p className="text-gray-600">
                {businesses.length} {businesses.length === 1 ? "business" : "businesses"} available
              </p>
            </div>

            {/* Business Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => {
                return (
                  <div
                    key={business.id}
                    className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Business Image or Placeholder - Clickable */}
                    <Link href={`/${business.slug}`} className="block">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer">
                        <Scissors className="w-16 h-16 text-gray-400" />
                      </div>
                    </Link>

                    {/* Business Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Business Name and Slug - Clickable */}
                      <Link href={`/${business.slug}`} className="block mb-3">
                        {/* Business Name - Bold */}
                        <h4 className="text-xl font-bold text-gray-900 mb-1 hover:text-gray-700">
                          {business.name}
                        </h4>
                        {/* Slug - Small Gray Text */}
                        <p className="text-xs text-gray-500">Slug: /{business.slug}</p>
                      </Link>

                      {/* Book Now Button */}
                      <div className="mt-auto pt-4">
                        <Link href={`/${business.slug}`}>
                          <Button size="sm" className="w-full">
                            Book Now
                            <ArrowRight className="w-3 h-3 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-gray-600" />
              <span className="text-gray-600 font-medium">Book.am</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/dashboard/login" className="hover:text-gray-900">
                Business Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
