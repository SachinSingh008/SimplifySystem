"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Invoice, InvoiceItem } from "@/types";
import LineItemsTable from "./LineItemsTable";
import TotalsSection from "./TotalsSection";
import TemplateSelector from "./TemplateSelector";
import { calculateGst } from "@/lib/invoiceHelpers";
import { useCustomers } from "@/hooks/useCustomers";

interface Props {
  mode: "create" | "edit";
  invoice?: Invoice;
  onSaved?: () => void;
}

const defaultItem: InvoiceItem = { name: "", hsn: "", qty: 1, unit: "Nos", rate: 0, gstPct: 18, amount: 0 };

export default function InvoiceForm({ mode, invoice, onSaved }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { customers } = useCustomers();

  const [form, setForm] = useState({
    customerName: invoice?.customerName ?? "",
    customerGstin: invoice?.customerGstin ?? "",
    customerId: invoice?.customerId ?? "",
    dueDate: invoice?.dueDate ?? "",
    notes: invoice?.notes ?? "",
    terms: invoice?.terms ?? "",
    templateId: invoice?.templateId ?? 1,
    isInterstate: false,
  });
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items ?? [{ ...defaultItem }]
  );
  const [saving, setSaving] = useState(false);

  const gst = calculateGst(items, form.isInterstate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const payload = {
        ...form,
        items,
        ...gst,
        status: "draft",
      };

      if (mode === "create") {
        const fn = httpsCallable(functions, "createInvoice");
        const result: any = await fn(payload);
        toast.success(`Invoice ${result.data.invoiceNumber} created!`);
        router.push(`/invoices/${result.data.invoiceId}`);
      } else {
        const fn = httpsCallable(functions, "updateInvoice");
        await fn({ invoiceId: invoice!.id, updates: payload });
        toast.success("Invoice updated!");
        onSaved?.();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
      {/* Left: Form fields */}
      <div className="lg:col-span-2 space-y-5">
        {/* Customer */}
        <div className="card p-6 space-y-4">
          <h3 className="font-poppins font-semibold text-slate-900">Customer Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inv-customer" className="label">Customer Name *</label>
              {customers.length > 0 ? (
                <select
                  id="inv-customer"
                  className="input"
                  value={form.customerId}
                  onChange={(e) => {
                    const c = customers.find((x) => x.id === e.target.value);
                    setForm((p) => ({
                      ...p,
                      customerId: e.target.value,
                      customerName: c?.name ?? "",
                      customerGstin: c?.gstin ?? "",
                    }));
                  }}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="inv-customer"
                  className="input"
                  placeholder="Customer name"
                  value={form.customerName}
                  onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                  required
                />
              )}
            </div>
            <div>
              <label htmlFor="inv-gstin" className="label">Customer GSTIN</label>
              <input id="inv-gstin" className="input font-mono" placeholder="29AAAAA0000A1Z5" value={form.customerGstin} onChange={(e) => setForm((p) => ({ ...p, customerGstin: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="inv-due" className="label">Due Date</label>
              <input id="inv-due" type="date" className="input" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="inv-interstate" type="checkbox" className="rounded" checked={form.isInterstate} onChange={(e) => setForm((p) => ({ ...p, isInterstate: e.target.checked }))} />
              <label htmlFor="inv-interstate" className="text-sm text-slate-700">Interstate supply (IGST)</label>
            </div>
          </div>
        </div>

        {/* Line items */}
        <LineItemsTable items={items} onChange={setItems} />

        {/* Notes & Terms */}
        <div className="card p-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-notes" className="label">Notes</label>
            <textarea id="inv-notes" className="input h-24 resize-none" placeholder="Additional notes…" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="inv-terms" className="label">Terms & Conditions</label>
            <textarea id="inv-terms" className="input h-24 resize-none" placeholder="Payment terms…" value={form.terms} onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Right: Totals + Template + Save */}
      <div className="space-y-5">
        <TotalsSection gst={gst} isInterstate={form.isInterstate} />
        <TemplateSelector selected={form.templateId as 1|2|3} onChange={(t) => setForm((p) => ({ ...p, templateId: t }))} />
        <button id="invoice-save-btn" type="submit" disabled={saving} className="btn-primary w-full justify-center">
          {saving ? "Saving…" : mode === "create" ? "Create Invoice" : "Update Invoice"}
        </button>
      </div>
    </form>
  );
}
