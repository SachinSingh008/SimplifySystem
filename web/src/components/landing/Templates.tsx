"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const templates = [
  {
    id: 1,
    name: "Classic",
    desc: "Traditional layout with a clean header, clear line items, and professional totals section.",
    accent: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    id: 2,
    name: "Modern",
    desc: "Bold design with a full-bleed header, sidebar totals, and contemporary typography.",
    accent: "#0f172a",
    bg: "#f8fafc",
  },
  {
    id: 3,
    name: "Minimal",
    desc: "Ultra-clean layout with generous whitespace — perfect for creative professionals.",
    accent: "#7c3aed",
    bg: "#faf5ff",
  },
];

function TemplateMock({ t }: { t: typeof templates[0] }) {
  return (
    <div
      className="rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
      style={{ background: t.bg }}
    >
      {/* Mock header */}
      <div className="p-4 flex justify-between items-start" style={{ borderBottom: `2px solid ${t.accent}20` }}>
        <div>
          <div className="w-20 h-3 rounded" style={{ background: t.accent }} />
          <div className="w-28 h-2 rounded mt-2 bg-slate-200" />
        </div>
        <div className="text-right">
          <div className="w-16 h-3 rounded bg-slate-200" />
          <div className="w-12 h-2 rounded mt-2 bg-slate-200" />
        </div>
      </div>
      {/* Mock items */}
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-32 h-2 rounded bg-slate-200" />
            <div className="w-16 h-2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      {/* Mock totals */}
      <div className="px-4 pb-4 flex justify-end">
        <div className="w-32 space-y-1.5">
          <div className="flex justify-between">
            <div className="w-12 h-2 rounded bg-slate-200" />
            <div className="w-14 h-2 rounded bg-slate-200" />
          </div>
          <div className="flex justify-between">
            <div className="w-16 h-3 rounded font-bold" style={{ background: t.accent }} />
            <div className="w-14 h-3 rounded" style={{ background: t.accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="templates" className="py-24 bg-surface" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-green-brand-600 font-semibold text-sm uppercase tracking-widest mb-3">Templates</p>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
            3 professional invoice designs
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Pick the layout that suits your brand. Every template is GST-compliant, PDF-ready, and fully customisable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <TemplateMock t={t} />
              <div className="mt-4 text-center">
                <h3 className="font-poppins font-semibold text-slate-900 mb-1">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
