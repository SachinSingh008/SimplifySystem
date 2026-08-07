"use client";

import { InvoiceItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { calculateLineItemAmount } from "@/lib/invoiceHelpers";

interface Props {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}

const defaultItem = (): InvoiceItem => ({
  name: "", hsn: "", qty: 1, unit: "Nos", rate: 0, gstPct: 18, amount: 0,
});

export default function LineItemsTable({ items, onChange }: Props) {
  const update = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      newItem.amount = calculateLineItemAmount(
        field === "qty" ? Number(value) : newItem.qty,
        field === "rate" ? Number(value) : newItem.rate
      );
      return newItem;
    });
    onChange(updated);
  };

  const addRow = () => onChange([...items, defaultItem()]);
  const removeRow = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-green-brand-100 flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-slate-900 text-sm">Line Items</h3>
        <button type="button" onClick={addRow} id="add-line-item" className="btn-secondary text-xs py-1.5 px-3">
          <Plus size={14} /> Add Item
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-brand-50">
            <tr className="text-xs text-slate-500">
              <th className="px-3 py-2 text-left font-medium w-48">Item</th>
              <th className="px-2 py-2 font-medium">HSN</th>
              <th className="px-2 py-2 font-medium">Qty</th>
              <th className="px-2 py-2 font-medium">Unit</th>
              <th className="px-2 py-2 font-medium">Rate (₹)</th>
              <th className="px-2 py-2 font-medium">GST%</th>
              <th className="px-2 py-2 font-medium text-right">Amount</th>
              <th className="px-2 py-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="px-3 py-2">
                  <input id={`item-name-${i}`} className="input text-xs" placeholder="Service / Product" value={item.name} onChange={(e) => update(i, "name", e.target.value)} />
                </td>
                <td className="px-2 py-2">
                  <input className="input text-xs w-20" placeholder="HSN" value={item.hsn} onChange={(e) => update(i, "hsn", e.target.value)} />
                </td>
                <td className="px-2 py-2">
                  <input type="number" className="input text-xs w-16" min={1} value={item.qty} onChange={(e) => update(i, "qty", Number(e.target.value))} />
                </td>
                <td className="px-2 py-2">
                  <select className="input text-xs w-20" value={item.unit} onChange={(e) => update(i, "unit", e.target.value)}>
                    {["Nos", "Hrs", "Days", "Kg", "Ltr", "Mtr", "Sqft", "Pcs"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input type="number" className="input text-xs w-24" min={0} value={item.rate} onChange={(e) => update(i, "rate", Number(e.target.value))} />
                </td>
                <td className="px-2 py-2">
                  <select className="input text-xs w-20" value={item.gstPct} onChange={(e) => update(i, "gstPct", Number(e.target.value))}>
                    {[0, 5, 12, 18, 28].map((g) => (
                      <option key={g} value={g}>{g}%</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2 text-right font-semibold text-slate-900">
                  ₹{item.amount.toFixed(2)}
                </td>
                <td className="px-2 py-2">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
