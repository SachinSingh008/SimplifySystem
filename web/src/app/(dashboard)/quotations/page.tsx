"use client";

import { useQuotations } from "@/hooks/useQuotations";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import toast from "react-hot-toast";
import type { Quotation } from "@/types";

const statusBadge: Record<string, string> = {
  open: "badge-yellow",
  closed: "badge-green",
  cancelled: "badge-red",
  draft: "badge-slate",
};

export default function QuotationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Quotation["status"] | "all">("all");
  const { quotations, loading } = useQuotations(statusFilter);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const filtered = quotations.filter((q) => {
    const matchSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleConvertToInvoice = async (e: React.MouseEvent, quotationId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Convert this quotation to a tax invoice?")) return;

    setConvertingId(quotationId);
    try {
      const convertFn = httpsCallable(functions, "convertToInvoice");
      const result: any = await convertFn({ quotationId });
      toast.success(`Invoice ${result.data.invoiceNumber} created!`);
      router.push(`/invoices/${result.data.invoiceId}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to convert quotation");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="quotation-search"
              className="input pl-9 w-64"
              placeholder="Search quotations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            id="quotation-status-filter"
            className="input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Link href="/quotations/new" className="btn-primary">
          <Plus size={16} /> New Quotation
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No quotations found.</p>
            <Link href="/quotations/new" className="btn-primary">
              Create Quotation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-brand-50 border-b border-green-brand-100">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-3 font-medium">Quotation #</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-green-brand-50/40 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-slate-900 font-semibold">
                        {q.quotationNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{q.customerName}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(q.total)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className={statusBadge[q.status] ?? "badge-slate"}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-2.5 items-center">
                        {q.status === "open" && !q.convertedToInvoiceId ? (
                          <button
                            id={`convert-btn-${q.id}`}
                            onClick={(e) => handleConvertToInvoice(e, q.id)}
                            disabled={convertingId === q.id}
                            className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 hover:border-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <RefreshCcw size={12} className={convertingId === q.id ? "animate-spin" : ""} />
                            Convert
                          </button>
                        ) : q.convertedToInvoiceId ? (
                          <Link
                            href={`/invoices/${q.convertedToInvoiceId}`}
                            className="text-xs text-slate-400 hover:text-green-brand-600 underline"
                          >
                            View Invoice
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
