import type { Invoice } from "@/types";
import { formatCurrency, formatDate, amountInWords } from "@/lib/invoiceHelpers";

interface Props { invoice: Invoice; }

export default function MinimalTemplate({ invoice }: Props) {
  return (
    <div className="p-12 font-dm-sans min-h-[842px] bg-white" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Minimal header */}
      <div className="flex justify-between items-end mb-12 pb-6 border-b border-slate-100">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">Invoice</p>
          <h1 className="font-poppins font-bold text-4xl text-slate-900">{invoice.invoiceNumber}</h1>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>{formatDate(invoice.createdAt)}</p>
          {invoice.dueDate && <p className="mt-1">Due {formatDate(invoice.dueDate)}</p>}
        </div>
      </div>

      {/* Bill to */}
      <div className="mb-10">
        <p className="text-xs text-slate-400 uppercase tracking-[0.15em] mb-3">Bill To</p>
        <p className="text-xl font-semibold text-slate-900">{invoice.customerName}</p>
        {invoice.customerGstin && <p className="text-sm text-slate-500 mt-1 font-mono">GSTIN: {invoice.customerGstin}</p>}
      </div>

      {/* Items — ultra minimal */}
      <div className="space-y-3 mb-10">
        {invoice.items.map((item, i) => (
          <div key={i} className="flex justify-between items-start py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.qty} {item.unit} × {formatCurrency(item.rate)} · GST {item.gstPct}%</p>
            </div>
            <p className="font-semibold text-slate-900">{formatCurrency(item.amount)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-60 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          {invoice.cgst > 0 && <div className="flex justify-between text-slate-500"><span>CGST</span><span>{formatCurrency(invoice.cgst)}</span></div>}
          {invoice.sgst > 0 && <div className="flex justify-between text-slate-500"><span>SGST</span><span>{formatCurrency(invoice.sgst)}</span></div>}
          {invoice.igst > 0 && <div className="flex justify-between text-slate-500"><span>IGST</span><span>{formatCurrency(invoice.igst)}</span></div>}
          <div className="pt-3 border-t border-slate-900 flex justify-between font-poppins font-bold text-slate-900 text-xl">
            <span>Total</span><span>{formatCurrency(invoice.total)}</span>
          </div>
          <p className="text-xs text-slate-400 italic">{amountInWords(invoice.total)}</p>
        </div>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="mt-12 pt-8 border-t border-slate-100 space-y-4">
          {invoice.notes && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-[0.15em] mb-1">Notes</p>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-[0.15em] mb-1">Terms</p>
              <p className="text-sm text-slate-600">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
