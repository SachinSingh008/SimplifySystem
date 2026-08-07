import type { GstBreakdown } from "@/lib/invoiceHelpers";
import { amountInWords } from "@/lib/invoiceHelpers";

interface Props {
  gst: GstBreakdown;
  isInterstate?: boolean;
}

export default function TotalsSection({ gst, isInterstate = false }: Props) {
  return (
    <div className="card p-5 space-y-2 text-sm">
      <h3 className="font-poppins font-semibold text-slate-900 text-sm mb-3">Summary</h3>

      <div className="flex justify-between text-slate-600">
        <span>Subtotal</span>
        <span>₹{gst.subtotal.toFixed(2)}</span>
      </div>

      {isInterstate ? (
        <div className="flex justify-between text-slate-600">
          <span>IGST</span>
          <span>₹{gst.igst.toFixed(2)}</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between text-slate-600">
            <span>CGST</span>
            <span>₹{gst.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>SGST</span>
            <span>₹{gst.sgst.toFixed(2)}</span>
          </div>
        </>
      )}

      <div className="border-t border-green-brand-100 pt-2 flex justify-between font-poppins font-bold text-green-brand-600 text-base">
        <span>Total</span>
        <span>₹{gst.total.toFixed(2)}</span>
      </div>

      <p className="text-xs text-slate-400 italic pt-1 leading-relaxed">
        {amountInWords(gst.total)}
      </p>
    </div>
  );
}
