"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const highlights = [
  "GST-compliant invoices in seconds",
  "3 professional templates",
  "Email OTP + Google login",
];

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-white via-green-brand-50 to-white pt-24 pb-16 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-green-brand-200/30 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-green-brand-100/40 blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-green-brand-100 text-green-brand-700 text-sm font-semibold px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-brand-500 animate-pulse" />
            Now with GST auto-calculation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-poppins font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight mb-6"
          >
            Invoice smarter,{" "}
            <span className="text-green-brand-600">get paid faster</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl"
          >
            SimplifySystems is the complete GST invoicing platform for Indian freelancers
            and small businesses. Create professional invoices, manage customers, and
            track payments — all in one place.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-2 mb-10"
          >
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle size={16} className="text-green-brand-500 shrink-0" />
                {h}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/login" className="btn-primary text-base px-7 py-3">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link href="#templates" className="btn-secondary text-base px-7 py-3">
              See Templates
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 80 }}
          className="hidden lg:block"
        >
          <div className="card p-8 shadow-glow relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-poppins font-bold text-xl text-slate-900">INVOICE</p>
                <p className="text-sm text-slate-500 mt-1">#INV-0042</p>
              </div>
              <span className="badge-green px-3 py-1">Paid</span>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { name: "Web Design Services", total: "₹25,000" },
                { name: "SEO Consultation (3 mo)", total: "₹15,000" },
              ].map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="font-semibold text-slate-900">{item.total}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-green-brand-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>₹40,000</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>CGST 9%</span><span>₹3,600</span></div>
              <div className="flex justify-between text-sm text-slate-500"><span>SGST 9%</span><span>₹3,600</span></div>
              <div className="flex justify-between font-poppins font-bold text-green-brand-600 text-lg pt-2">
                <span>Total</span><span>₹47,200</span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-green-brand-600 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-lg rotate-3">
              GST Compliant ✓
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
