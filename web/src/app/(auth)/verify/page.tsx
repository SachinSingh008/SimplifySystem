"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowLeft, RefreshCw } from "lucide-react";
import { verifyOtp, sendOtp } from "@/lib/auth";
import toast from "react-hot-toast";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return toast.error("Please enter all 6 digits");
    setVerifying(true);
    try {
      await verifyOtp(email, code);
      toast.success("Verified! Redirecting…");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(email);
      setOtp(Array(6).fill(""));
      setResendTimer(60);
      toast.success("New OTP sent!");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to resend");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-brand-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-brand-600 shadow-glow mb-4">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-slate-900">Check your email</h1>
          <p className="text-slate-500 mt-2 text-sm">
            We sent a 6-digit code to <strong className="text-slate-700">{email}</strong>
          </p>
        </div>

        <div className="card p-8 space-y-6">
          {/* 6-box OTP input */}
          <div className="flex gap-3 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-box-${i}`}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-green-brand-500 focus:ring-2 focus:ring-green-brand-500/20 text-slate-900"
              />
            ))}
          </div>

          <button
            id="verify-otp-btn"
            onClick={handleVerify}
            disabled={verifying || otp.join("").length < 6}
            className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying…" : "Verify & Sign In"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={14} /> Change email
            </button>
            <button
              id="resend-otp-btn"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="flex items-center gap-1.5 text-green-brand-600 disabled:text-slate-400 disabled:cursor-not-allowed hover:text-green-brand-700 transition-colors"
            >
              <RefreshCw size={14} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
