import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-2">Business not found</h1>
      <p className="text-gray-600 mb-6">
        The business you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="text-black underline hover:no-underline"
      >
        Go back home
      </Link>
    </div>
  );
}
