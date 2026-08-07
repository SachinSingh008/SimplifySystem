"use client";

import { usePayments } from "@/hooks/usePayments";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import { Plus, Search, Eye, FileText } from "lucide-react";
import { useState } from "react";
import PaymentModal from "@/components/dashboard/PaymentModal";
import Link from "next/link";

export default function PaymentsPage() {
  const { payments, loading } = usePayments();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = payments.filter((p) =>
    (p.upiRef ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.mode ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.notes ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="payment-search"
            className="input pl-9 w-64"
            placeholder="Search payments by Ref/Mode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          id="log-payment-btn"
          onClick={() => setModalOpen(true)}
          className="btn-primary font-poppins text-sm"
        >
          <Plus size={16} /> Log Payment
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {search ? "No payments found matching search query." : "No payment logs recorded yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-brand-50 border-b border-green-brand-100">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">UPI Ref / Notes</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-green-brand-50/40 transition-colors">
                    <td className="px-6 py-3.5 text-slate-700">
                      {formatDate(p.date)}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      <Link
                        href={`/invoices/${p.invoiceId}`}
                        className="text-green-brand-600 hover:underline inline-flex items-center gap-1.5"
                      >
                        <FileText size={14} />
                        View Invoice
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                        {p.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {p.upiRef ? (
                        <span className="font-mono text-xs font-semibold block text-slate-800">
                          Ref: {p.upiRef}
                        </span>
                      ) : null}
                      {p.notes ? (
                        <span className="text-xs text-slate-400 block truncate max-w-xs">
                          {p.notes}
                        </span>
                      ) : (
                        !p.upiRef && <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/invoices/${p.invoiceId}`}
                        className="p-1.5 text-slate-400 hover:text-green-brand-600 transition-colors inline-block"
                        title="View Invoice"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
