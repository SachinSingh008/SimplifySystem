"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Zap } from "lucide-react";
import { signInWithGoogle, sendOtp } from "@/lib/auth";
import toast from "react-hot-toast";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await sendOtp(email);
      toast.success("OTP sent! Check your inbox.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send OTP");
    } finally {
      setSending(false);
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-brand-600 shadow-glow mb-4">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="font-poppins font-bold text-2xl text-slate-900">
            Welcome to SimplifySystems
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your invoices</p>
        </div>

        <div className="card p-8 space-y-6">
          {/* Google */}
          <GoogleButton onClick={handleGoogleLogin} />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OR CONTINUE WITH EMAIL</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OTP form */}
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
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
              id="login-send-otp"
              type="submit"
              disabled={sending || !email}
              className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Sending OTP…" : "Send OTP"}
              {!sending && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-green-brand-600 hover:underline">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-green-brand-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
