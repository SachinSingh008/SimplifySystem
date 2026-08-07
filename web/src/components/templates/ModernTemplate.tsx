import type { Invoice } from "@/types";
import { formatCurrency, formatDate, amountInWords } from "@/lib/invoiceHelpers";

interface Props { invoice: Invoice; }

export default function ModernTemplate({ invoice }: Props) {
  return (
    <div className="min-h-[842px] font-dm-sans" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Bold green header */}
      <div className="bg-slate-900 text-white px-10 py-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-poppins font-bold text-3xl tracking-tight">INVOICE</h1>
            <p className="text-slate-400 mt-1">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-brand-500/20 text-green-brand-400">
              {invoice.status.toUpperCase()}
            </span>
            <p className="text-slate-400 text-xs mt-2">{formatDate(invoice.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-10">
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</p>
          <p className="font-bold text-slate-900 text-xl">{invoice.customerName}</p>
          {invoice.customerGstin && <p className="text-sm text-slate-500 font-mono mt-1">GSTIN: {invoice.customerGstin}</p>}
        </div>

        <table className="w-full text-sm mb-8 border border-slate-200 rounded-xl overflow-hidden">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Item</th>
              <th className="px-3 py-3 font-medium text-xs uppercase tracking-wider text-center">Qty</th>
              <th className="px-3 py-3 font-medium text-xs uppercase tracking-wider text-right">Rate</th>
              <th className="px-3 py-3 font-medium text-xs uppercase tracking-wider text-center">GST%</th>
              <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-3 py-3 text-center text-slate-500">{item.qty}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-3 py-3 text-center text-slate-500">{item.gstPct}%</td>
                <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {invoice.cgst > 0 && <div className="flex justify-between text-slate-600"><span>CGST</span><span>{formatCurrency(invoice.cgst)}</span></div>}
            {invoice.sgst > 0 && <div className="flex justify-between text-slate-600"><span>SGST</span><span>{formatCurrency(invoice.sgst)}</span></div>}
            {invoice.igst > 0 && <div className="flex justify-between text-slate-600"><span>IGST</span><span>{formatCurrency(invoice.igst)}</span></div>}
            <div className="border-t border-slate-300 pt-2 flex justify-between font-poppins font-black text-slate-900 text-lg">
              <span>Total</span><span>{formatCurrency(invoice.total)}</span>
            </div>
            <p className="text-xs text-slate-400 italic">{amountInWords(invoice.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
