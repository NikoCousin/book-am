"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, MessageSquare, Shield } from "lucide-react";

interface ConfirmFormProps {
  businessId: string;
  businessSlug: string;
  serviceId: string;
  date: string;
  time: string;
  staffId?: string;
}

type FormStep = "details" | "verify";

export function ConfirmForm({
  businessId,
  businessSlug,
  serviceId,
  date,
  time,
  staffId,
}: ConfirmFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+374");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Verification
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState("");

  const validatePhone = (phone: string): boolean => {
    // Armenian phone format: +374XXXXXXXX (8 digits after +374)
    const phoneRegex = /^\+374\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Please enter a valid Armenian phone number (+374XXXXXXXX)");
      return;
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setStep("verify");
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
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          serviceId,
          date,
          time,
          staffId: staffId || null,
          customerName: name.trim(),
          customerPhone: phone.replace(/\s/g, ""),
          customerEmail: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Redirect to success page with booking ID
      router.push(
        `/${businessSlug}/book/${serviceId}/success?bookingId=${data.bookingId}`
      );
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
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("details");
              setEnteredCode("");
              setError(null);
            }}
            className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Back to edit details
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmitDetails} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Your Name *</span>
          </div>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Phone Number *</span>
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
          placeholder="+37491234567"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Armenian format: +374XXXXXXXX</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email (optional)</span>
          </div>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Notes (optional)</span>
          </div>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all"
      >
        Continue to Verify
      </button>
    </form>
  );
}
