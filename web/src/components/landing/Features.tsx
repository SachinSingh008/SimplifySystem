"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText, Users, Package, CreditCard, Download, Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "GST Invoices",
    desc: "Auto-calculate CGST, SGST & IGST. Generate compliant invoices in seconds with Indian number formatting.",
  },
  {
    icon: Users,
    title: "Customer Management",
    desc: "Maintain a full customer database with GSTIN, PAN, billing history, and total billed amounts.",
  },
  {
    icon: Package,
    title: "Product Catalog",
    desc: "Save your products/services with HSN codes, rates, and GST percentages for one-click line items.",
  },
  {
    icon: FileText,
    title: "Quotations",
    desc: "Create professional quotations and convert them to invoices with a single click when approved.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    desc: "Log payments (UPI, cash, bank, cheque), mark invoices paid, and track outstanding amounts.",
  },
  {
    icon: Download,
    title: "PDF Export",
    desc: "Download pixel-perfect PDF invoices. Choose from 3 templates — Classic, Modern, or Minimal.",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-green-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
            Everything you need to run your business
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From invoice creation to payment tracking — SimplifySystems covers every part of your billing workflow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-6 hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-brand-100 flex items-center justify-center mb-4 group-hover:bg-green-brand-600 transition-colors duration-300">
                <f.icon size={20} className="text-green-brand-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-poppins font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
