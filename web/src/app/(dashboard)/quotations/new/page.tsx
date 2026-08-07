"use client";

import QuotationForm from "@/components/quotation/QuotationForm";

export default function NewQuotationPage() {
  return (
    <div>
      <h2 className="font-poppins font-semibold text-lg text-slate-900 mb-6">Create New Quotation</h2>
      <QuotationForm />
    </div>
  );
}
