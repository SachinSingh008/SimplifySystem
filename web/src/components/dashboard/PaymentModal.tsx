"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useInvoices } from "@/hooks/useInvoices";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { invoices } = useInvoices();
  // Filter for pending invoices to show in dropdown
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");

  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [upiRef, setUpiRef] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setInvoiceId("");
      setAmount("");
      setMode("cash");
      setUpiRef("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setErrors({});
    }
  }, [open]);

  // Autofill amount when invoice is selected
  useEffect(() => {
    if (invoiceId) {
      const selected = pendingInvoices.find((inv) => inv.id === invoiceId);
      if (selected) {
        setAmount(String(selected.total));
      }
    } else {
      setAmount("");
    }
  }, [invoiceId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!invoiceId) newErrors.invoiceId = "Please select an invoice";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Valid payment amount is required";
    }
    if (mode === "upi" && !upiRef.trim()) {
      newErrors.upiRef = "UPI Reference number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const selectedInvoice = pendingInvoices.find((inv) => inv.id === invoiceId);
      const payload = {
        invoiceId,
        customerId: selectedInvoice?.customerId ?? null,
        amount: Number(amount),
        mode,
        upiRef: mode === "upi" ? upiRef.trim() : null,
        date: new Date(date).toISOString(),
        notes: notes.trim(),
      };

      const logPaymentFn = httpsCallable(functions, "logPayment");
      await logPaymentFn(payload);
      toast.success("Payment logged successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to log payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Payment"
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="pay-modal-invoice" className="label">Select Invoice *</label>
          <select
            id="pay-modal-invoice"
            className="input"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          >
            <option value="">Select a pending invoice</option>
            {pendingInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.customerName} (Due: ₹{inv.total.toFixed(2)})
              </option>
            ))}
          </select>
          {errors.invoiceId && <p className="mt-1 text-xs text-red-500">{errors.invoiceId}</p>}
          {pendingInvoices.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">No pending invoices found to log payment.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="pay-modal-amount"
            label="Payment Amount (₹) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
          <div>
            <label htmlFor="pay-modal-mode" className="label">Payment Mode</label>
            <select
              id="pay-modal-mode"
              className="input"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {mode === "upi" && (
          <Input
            id="pay-modal-upiref"
            label="UPI Transaction ID / Ref *"
            placeholder="e.g. 123456789012"
            value={upiRef}
            onChange={(e) => setUpiRef(e.target.value)}
            error={errors.upiRef}
          />
        )}

        <Input
          id="pay-modal-date"
          label="Payment Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div>
          <label htmlFor="pay-modal-notes" className="label">Notes / Reference Details</label>
          <textarea
            id="pay-modal-notes"
            className="input min-h-[80px] resize-none"
            placeholder="Additional details about the transaction"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-green-brand-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={saving}
            disabled={pendingInvoices.length === 0}
            id="pay-modal-submit"
          >
            Log Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
