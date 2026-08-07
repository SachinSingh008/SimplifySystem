"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/new": "New Invoice",
  "/quotations": "Quotations",
  "/quotations/new": "New Quotation",
  "/customers": "Customers",
  "/products": "Products",
  "/payments": "Payments",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] ?? "Dashboard";

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-green-brand-100 sticky top-0 z-10">
      <h1 className="font-poppins font-semibold text-lg text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        <Link
          href="/invoices/new"
          id="topbar-create-invoice"
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          Create Invoice
        </Link>
        <button
          id="topbar-notifications"
          className="p-2 rounded-lg hover:bg-green-brand-50 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-slate-600" />
        </button>
      </div>
    </header>
  );
}
