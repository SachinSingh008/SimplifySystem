"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, FileText, Phone, Mail, MapPin, CreditCard, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import type { Customer, Invoice } from "@/types";
import Link from "next/link";

interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export default function CustomerDrawer({ open, onClose, customer }: CustomerDrawerProps) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customer || !user) return;

    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "invoices"),
          where("userId", "==", user.uid),
          where("customerId", "==", customer.id),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? "",
        })) as Invoice[];
        setInvoices(list);
      } catch (err) {
        console.error("Error fetching customer invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [customer, open, user]);

  const statusBadge: Record<string, string> = {
    paid: "badge-green",
    pending: "badge-yellow",
    draft: "badge-slate",
    cancelled: "badge-red",
  };

  return (
    <AnimatePresence>
      {open && customer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-green-brand-100 flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-lg text-slate-900">{customer.name}</h3>
                <span className="text-xs text-slate-500 font-medium">Customer Profile</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats Card */}
              <div className="bg-green-brand-50/50 border border-green-brand-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Total Billed</p>
                  <p className="font-poppins font-bold text-2xl text-green-brand-700">
                    {formatCurrency(customer.totalBilled)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-brand-100 flex items-center justify-center text-green-brand-600">
                  <CreditCard size={22} />
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-slate-400">Contact Details</h4>
                <div className="grid gap-3.5 text-sm text-slate-700">
                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-slate-400 flex-shrink-0" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-400 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-line leading-relaxed">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Details */}
              {(customer.gstin || customer.pan) && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-slate-400">Tax Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {customer.gstin && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5 font-medium">GSTIN</span>
                        <span className="font-mono text-xs font-semibold text-slate-900">{customer.gstin}</span>
                      </div>
                    )}
                    {customer.pan && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5 font-medium">PAN</span>
                        <span className="font-mono text-xs font-semibold text-slate-900">{customer.pan}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invoices List */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-poppins font-semibold text-xs uppercase tracking-wider text-slate-400">Invoice History</h4>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No invoices recorded for this customer.</p>
                ) : (
                  <div className="space-y-2.5">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3.5 border border-slate-100 hover:border-green-brand-200 rounded-xl hover:bg-green-brand-50/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="text-sm font-semibold text-green-brand-600 hover:underline block truncate"
                            >
                              {inv.invoiceNumber}
                            </Link>
                            <span className="text-xs text-slate-400">{formatDate(inv.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-3">
                          <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                          <span className={`${statusBadge[inv.status]} text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
