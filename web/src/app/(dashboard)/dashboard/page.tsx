"use client";

import { IndianRupee, FileText, Users, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useInvoices } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import Link from "next/link";

export default function DashboardPage() {
  const { invoices, loading: invLoading } = useInvoices();
  const { customers, loading: custLoading } = useCustomers();

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.total, 0);

  const recentInvoices = invoices.slice(0, 5);

  const statusBadge: Record<string, string> = {
    paid: "badge-green",
    pending: "badge-yellow",
    draft: "badge-slate",
    cancelled: "badge-red",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={IndianRupee}
          trend={12}
          color="green"
        />
        <StatCard
          title="Total Invoices"
          value={String(invoices.length)}
          icon={FileText}
          trend={8}
          color="blue"
        />
        <StatCard
          title="Customers"
          value={String(customers.length)}
          icon={Users}
          trend={5}
          color="yellow"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={Clock}
          color="red"
        />
      </div>

      {/* Recent Invoices */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-poppins font-semibold text-slate-900">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-green-brand-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {invLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm mb-4">No invoices yet.</p>
            <Link href="/invoices/new" className="btn-primary">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-green-brand-100">
                  <th className="pb-3 font-medium">Invoice #</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-green-brand-50/50 transition-colors">
                    <td className="py-3">
                      <Link href={`/invoices/${inv.id}`} className="text-green-brand-600 font-semibold hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-700">{inv.customerName}</td>
                    <td className="py-3 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className="py-3 text-slate-500">{formatDate(inv.createdAt)}</td>
                    <td className="py-3">
                      <span className={statusBadge[inv.status] ?? "badge-slate"}>
                        {inv.status}
                      </span>
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
