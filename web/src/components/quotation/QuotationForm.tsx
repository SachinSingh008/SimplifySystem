"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { InvoiceItem } from "@/types";
import LineItemsTable from "../invoice/LineItemsTable";
import TotalsSection from "../invoice/TotalsSection";
import TemplateSelector from "../invoice/TemplateSelector";
import { calculateGst } from "@/lib/invoiceHelpers";
import { useCustomers } from "@/hooks/useCustomers";

const defaultItem: InvoiceItem = { name: "", hsn: "", qty: 1, unit: "Nos", rate: 0, gstPct: 18, amount: 0 };

export default function QuotationForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { customers } = useCustomers();

  const [form, setForm] = useState({
    customerName: "",
    customerGstin: "",
    customerId: "",
    dueDate: "",
    notes: "",
    terms: "",
    templateId: 1,
    isInterstate: false,
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ ...defaultItem }]);
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
      };

      const createQuotationFn = httpsCallable(functions, "createQuotation");
      const result: any = await createQuotationFn(payload);
      toast.success(`Quotation ${result.data.quotationNumber} created!`);
      router.push("/quotations");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save quotation");
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
              <label htmlFor="quo-customer" className="label">Customer Name *</label>
              {customers.length > 0 ? (
                <select
                  id="quo-customer"
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
                  id="quo-customer"
                  className="input"
                  placeholder="Customer name"
                  value={form.customerName}
                  onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                  required
                />
              )}
            </div>
            <div>
              <label htmlFor="quo-gstin" className="label">Customer GSTIN</label>
              <input
                id="quo-gstin"
                className="input font-mono"
                placeholder="29AAAAA0000A1Z5"
                value={form.customerGstin}
                onChange={(e) => setForm((p) => ({ ...p, customerGstin: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="quo-due" className="label">Valid Until (Date)</label>
              <input
                id="quo-due"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="quo-interstate"
                type="checkbox"
                className="rounded"
                checked={form.isInterstate}
                onChange={(e) => setForm((p) => ({ ...p, isInterstate: e.target.checked }))}
              />
              <label htmlFor="quo-interstate" className="text-sm text-slate-700">Interstate supply (IGST)</label>
            </div>
          </div>
        </div>

        {/* Line items */}
        <LineItemsTable items={items} onChange={setItems} />

        {/* Notes & Terms */}
        <div className="card p-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quo-notes" className="label">Notes</label>
            <textarea
              id="quo-notes"
              className="input h-24 resize-none"
              placeholder="Additional notes…"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="quo-terms" className="label">Terms & Conditions</label>
            <textarea
              id="quo-terms"
              className="input h-24 resize-none"
              placeholder="Validity or terms…"
              value={form.terms}
              onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Right: Totals + Template + Save */}
      <div className="space-y-5">
        <TotalsSection gst={gst} isInterstate={form.isInterstate} />
        <TemplateSelector selected={form.templateId as 1|2|3} onChange={(t) => setForm((p) => ({ ...p, templateId: t }))} />
        <button id="quotation-save-btn" type="submit" disabled={saving} className="btn-primary w-full justify-center">
          {saving ? "Saving…" : "Save Quotation"}
        </button>
      </div>
    </form>
  );
}
