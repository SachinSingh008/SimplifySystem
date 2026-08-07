import type { Invoice } from "@/types";
import { formatCurrency, formatDate, amountInWords } from "@/lib/invoiceHelpers";

interface Props { invoice: Invoice; }

export default function ClassicTemplate({ invoice }: Props) {
  return (
    <div className="p-10 font-dm-sans text-slate-800 min-h-[842px]" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-green-brand-600">INVOICE</h1>
          <p className="text-slate-500 text-sm mt-1">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            invoice.status === "paid" ? "bg-green-100 text-green-700" :
            invoice.status === "pending" ? "bg-yellow-100 text-yellow-700" :
            "bg-slate-100 text-slate-600"
          }`}>{invoice.status.toUpperCase()}</span>
          <p className="text-xs text-slate-500 mt-2">Date: {formatDate(invoice.createdAt)}</p>
          {invoice.dueDate && <p className="text-xs text-slate-500">Due: {formatDate(invoice.dueDate)}</p>}
        </div>
      </div>

      <div className="border-b-2 border-green-brand-600 mb-8" />

      {/* Bill To */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
        <p className="font-semibold text-slate-900 text-lg">{invoice.customerName}</p>
        {invoice.customerGstin && <p className="text-sm text-slate-500 font-mono">GSTIN: {invoice.customerGstin}</p>}
      </div>

      {/* Line items */}
      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="bg-green-brand-50 text-left">
            <th className="px-4 py-3 font-semibold text-slate-700 rounded-l-lg">Item</th>
            <th className="px-3 py-3 font-semibold text-slate-700">HSN</th>
            <th className="px-3 py-3 font-semibold text-slate-700 text-center">Qty</th>
            <th className="px-3 py-3 font-semibold text-slate-700">Unit</th>
            <th className="px-3 py-3 font-semibold text-slate-700 text-right">Rate</th>
            <th className="px-3 py-3 font-semibold text-slate-700 text-center">GST%</th>
            <th className="px-4 py-3 font-semibold text-slate-700 text-right rounded-r-lg">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoice.items.map((item, i) => (
            <tr key={i}>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-3 py-3 font-mono text-xs text-slate-500">{item.hsn || "—"}</td>
              <td className="px-3 py-3 text-center">{item.qty}</td>
              <td className="px-3 py-3 text-slate-500">{item.unit}</td>
              <td className="px-3 py-3 text-right">{formatCurrency(item.rate)}</td>
              <td className="px-3 py-3 text-center">{item.gstPct}%</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          {invoice.cgst > 0 && <div className="flex justify-between text-slate-600"><span>CGST</span><span>{formatCurrency(invoice.cgst)}</span></div>}
          {invoice.sgst > 0 && <div className="flex justify-between text-slate-600"><span>SGST</span><span>{formatCurrency(invoice.sgst)}</span></div>}
          {invoice.igst > 0 && <div className="flex justify-between text-slate-600"><span>IGST</span><span>{formatCurrency(invoice.igst)}</span></div>}
          <div className="border-t-2 border-green-brand-600 pt-2 flex justify-between font-poppins font-bold text-green-brand-600 text-base">
            <span>Total</span><span>{formatCurrency(invoice.total)}</span>
          </div>
          <p className="text-xs text-slate-400 italic">{amountInWords(invoice.total)}</p>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
          <p className="text-sm text-slate-600">{invoice.notes}</p>
        </div>
      )}
      {invoice.terms && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Terms</p>
          <p className="text-sm text-slate-600">{invoice.terms}</p>
        </div>
      )}
    </div>
  );
}
