"use client";

import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, FileText, FileCheck,
  Users, Package, CreditCard, Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomNav = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-brand-100 flex z-50">
        {bottomNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            id={`bottom-nav-${item.label.toLowerCase()}`}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-slate-500 hover:text-green-brand-600 transition-colors"
          >
            <item.icon size={20} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
