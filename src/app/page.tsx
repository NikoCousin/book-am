import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-3 mb-8">
          <Scissors className="w-10 h-10" />
          <h1 className="text-5xl font-bold tracking-tight">Book.am</h1>
        </div>

        <p className="text-gray-600 text-lg mb-12 text-center max-w-md">
          Booking platform for barbers and salons in Armenia
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg">Register Business</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
