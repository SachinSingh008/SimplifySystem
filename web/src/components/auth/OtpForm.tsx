"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { sendOtp } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOtp(email);
      toast.success("OTP sent!");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp-email" className="label">Email address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="otp-email"
            type="email"
            className="input pl-9"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <button
        id="otp-send-btn"
        type="submit"
        disabled={loading || !email}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send OTP"}
        {!loading && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
