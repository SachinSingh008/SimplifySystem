"use client";

import { useInvoices } from "@/hooks/useInvoices";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import type { Invoice } from "@/types";

const statusBadge: Record<string, string> = {
  paid: "badge-green", pending: "badge-yellow",
  draft: "badge-slate", cancelled: "badge-red",
};

export default function InvoicesPage() {
  const { invoices, loading } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Invoice["status"] | "all">("all");

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="invoice-search"
              className="input pl-9 w-64"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            id="invoice-status-filter"
            className="input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Link href="/invoices/new" className="btn-primary">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">No invoices found.</p>
            <Link href="/invoices/new" className="btn-primary">Create Invoice</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-green-brand-50 border-b border-green-brand-100">
              <tr className="text-left text-slate-600">
                <th className="px-6 py-3 font-medium">Invoice #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-green-brand-50/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <Link href={`/invoices/${inv.id}`} className="text-green-brand-600 font-semibold hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{inv.customerName}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3.5 text-slate-500">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={statusBadge[inv.status] ?? "badge-slate"}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/invoices/${inv.id}`} className="text-xs text-slate-500 hover:text-green-brand-600">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
