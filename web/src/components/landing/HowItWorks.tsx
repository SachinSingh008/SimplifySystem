"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { LogIn, FileEdit, Download } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    step: "01",
    title: "Sign up in seconds",
    desc: "Use Google OAuth or your email with a one-time OTP. No passwords to remember.",
  },
  {
    icon: FileEdit,
    step: "02",
    title: "Create your invoice",
    desc: "Fill in customer details, add line items with HSN codes, and let us auto-calculate GST.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download & share",
    desc: "Export a pixel-perfect PDF or share a link. Log payment once it's received.",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-green-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">How it Works</p>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
            Up and running in 3 steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-green-brand-200 via-green-brand-400 to-green-brand-200" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-2xl bg-green-brand-600 flex items-center justify-center shadow-glow mx-auto mb-6">
                  <s.icon size={28} className="text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-brand-100 text-green-brand-700 text-xs font-bold flex items-center justify-center border-2 border-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-poppins font-semibold text-slate-900 text-lg mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
