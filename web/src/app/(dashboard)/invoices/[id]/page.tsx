"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invoice } from "@/types";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import { formatCurrency, formatDate } from "@/lib/invoiceHelpers";
import { exportInvoicePDF } from "@/lib/pdfExport";
import { Download, Edit } from "lucide-react";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, "invoices", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setInvoice({
          id: snap.id,
          ...snap.data(),
          createdAt: snap.data().createdAt?.toDate?.()?.toISOString() ?? "",
          updatedAt: snap.data().updatedAt?.toDate?.()?.toISOString() ?? "",
        } as Invoice);
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400">Loading…</div>;
  if (!invoice) return <div className="text-center py-12 text-slate-500">Invoice not found.</div>;

  if (editing) return (
    <div>
      <button onClick={() => setEditing(false)} className="mb-4 text-sm text-slate-500 hover:text-slate-700">← Back to view</button>
      <InvoiceForm mode="edit" invoice={invoice} onSaved={() => setEditing(false)} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-poppins font-bold text-xl text-slate-900">{invoice.invoiceNumber}</h2>
          <p className="text-sm text-slate-500">{invoice.customerName} · {formatDate(invoice.createdAt)}</p>
        </div>
        <div className="flex gap-3">
          <button
            id="invoice-edit-btn"
            onClick={() => setEditing(true)}
            className="btn-secondary"
          >
            <Edit size={15} /> Edit
          </button>
          <button
            id="invoice-download-btn"
            onClick={() => exportInvoicePDF("invoice-preview-root", invoice)}
            className="btn-primary"
          >
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
