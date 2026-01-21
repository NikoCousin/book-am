"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Shield } from "lucide-react";

type FormStep = "phone" | "verify";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState("+374");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState("");

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+374\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\s/g, "");
    if (!validatePhone(cleanPhone)) {
      setError("Please enter a valid Armenian phone number (+374XXXXXXXX)");
      return;
    }

    setLoading(true);

    try {
      // Check if business exists with this phone
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, action: "send-code" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      // Generate fake code for display
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredCode !== generatedCode) {
      setError("Invalid verification code. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, action: "verify" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="space-y-6">
        {/* Show generated code (temporary for development) */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Verification Code</span>
          </div>
          <p className="text-amber-700 text-sm mb-3">
            In production, this code would be sent via SMS. For now, use this code:
          </p>
          <div className="bg-white border-2 border-amber-300 rounded-lg px-4 py-3 text-center">
            <span className="text-2xl font-mono font-bold tracking-widest text-gray-900">
              {generatedCode}
            </span>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enteredCode.length !== 6 || loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all
              ${
                enteredCode.length === 6 && !loading
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setEnteredCode("");
              setError(null);
            }}
            className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Use different phone number
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Business Phone Number</span>
          </div>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            let val = e.target.value;
            if (!val.startsWith("+374")) {
              val = "+374";
            }
            setPhone(val);
          }}
          placeholder="+37491123456"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the phone number registered with your business
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {loading ? "Checking..." : "Send Code"}
      </button>
    </form>
  );
}
