"use client";

import InvoiceForm from "@/components/invoice/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <h2 className="font-poppins font-semibold text-lg text-slate-900 mb-6">Create New Invoice</h2>
      <InvoiceForm mode="create" />
    </div>
  );
}
