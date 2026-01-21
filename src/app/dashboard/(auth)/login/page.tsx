import { LoginForm } from "@/components/dashboard/login-form";
import { Scissors } from "lucide-react";

export default function LoginPage() {
  // Middleware handles auth redirects - no need to check here

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scissors className="w-8 h-8 text-gray-900" />
            <span className="text-2xl font-bold text-gray-900">Book.am</span>
          </div>
          <p className="text-gray-600">Business Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Login to your account
          </h1>
          <LoginForm />
        </div>

        {/* Help Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have a business account?{" "}
          <a href="/register" className="text-gray-900 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
