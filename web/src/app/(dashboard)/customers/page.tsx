"use client";

import { useCustomers } from "@/hooks/useCustomers";
import { formatCurrency } from "@/lib/invoiceHelpers";
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CustomerModal from "@/components/dashboard/CustomerModal";
import CustomerDrawer from "@/components/dashboard/CustomerDrawer";
import toast from "react-hot-toast";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const { customers, loading } = useCustomers();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, c: Customer) => {
    e.stopPropagation();
    setSelectedCustomer(c);
    setModalOpen(true);
  };

  const handleRowClick = (c: Customer) => {
    setSelectedCustomer(c);
    setDrawerOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, c: Customer) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${c.name}?`)) return;

    try {
      await deleteDoc(doc(db, "customers", c.id));
      toast.success("Customer deleted");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete customer");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="customer-search"
            className="input pl-9 w-64"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          id="add-customer-btn"
          onClick={handleAddClick}
          className="btn-primary font-poppins text-sm"
        >
          <Plus size={16} /> Add Customer
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
            {search ? "No customers found matching search query." : "No customers added yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-brand-50 border-b border-green-brand-100">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">GSTIN</th>
                  <th className="px-4 py-3 font-medium">Total Billed</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleRowClick(c)}
                    className="hover:bg-green-brand-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900 group-hover:text-green-brand-700">
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{c.email ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{c.gstin ?? "—"}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(c.totalBilled)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(c);
                          }}
                          className="p-1 text-slate-400 hover:text-green-brand-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={(e) => handleEditClick(e, c)}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, c)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={selectedCustomer}
      />

      <CustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  );
}
