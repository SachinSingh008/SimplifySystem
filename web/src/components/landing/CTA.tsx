"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-green-brand-600 to-green-brand-700 rounded-3xl p-12 shadow-glow relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white mb-4">
              Start invoicing for free today
            </h2>
            <p className="text-green-brand-200 text-lg mb-8 max-w-xl mx-auto">
              No credit card required. Set up in under 5 minutes.
            </p>
            <Link
              href="/login"
              id="cta-get-started"
              className="inline-flex items-center gap-2 bg-white text-green-brand-700 font-semibold px-8 py-4 rounded-xl hover:bg-green-brand-50 transition-all duration-200 shadow-lg active:scale-95 text-base"
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
