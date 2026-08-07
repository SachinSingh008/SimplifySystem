"use client";

import { useProducts } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/invoiceHelpers";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductModal from "@/components/dashboard/ProductModal";
import toast from "react-hot-toast";
import type { Product } from "@/types";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.hsn.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClick = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditClick = (p: Product) => {
    setSelectedProduct(p);
    setModalOpen(true);
  };

  const handleDeleteClick = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${p.name}?`)) return;

    try {
      await deleteDoc(doc(db, "products", p.id));
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete product");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="product-search"
            className="input pl-9 w-64"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          id="add-product-btn"
          onClick={handleAddClick}
          className="btn-primary font-poppins text-sm"
        >
          <Plus size={16} /> Add Product
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
            {search ? "No products found matching search query." : "No products added yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-brand-50 border-b border-green-brand-100">
                <tr className="text-left text-slate-600">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">HSN / SAC</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Base Price</th>
                  <th className="px-4 py-3 font-medium">GST %</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-green-brand-50/40 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{p.hsn || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-600">{p.unit}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge-green">{p.gstPct}%</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Product"
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

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
