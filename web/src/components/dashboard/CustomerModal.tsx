"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, updateDoc } from "firebase/firestore";
import { functions, db } from "@/lib/firebase";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { Customer } from "@/types";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null; // If provided, we are in Edit mode
}

export default function CustomerModal({ open, onClose, customer }: CustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setName(customer.name ?? "");
      setPhone(customer.phone ?? "");
      setEmail(customer.email ?? "");
      setAddress(customer.address ?? "");
      setGstin(customer.gstin ?? "");
      setPan(customer.pan ?? "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setGstin("");
      setPan("");
    }
    setErrors({});
  }, [customer, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    
    if (gstin && gstin.length !== 15) {
      newErrors.gstin = "GSTIN must be exactly 15 characters";
    }
    if (pan && pan.length !== 10) {
      newErrors.pan = "PAN must be exactly 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
        gstin: gstin.trim().toUpperCase() || null,
        pan: pan.trim().toUpperCase() || null,
      };

      if (customer) {
        // Edit mode: Update Firestore document directly
        const customerRef = doc(db, "customers", customer.id);
        await updateDoc(customerRef, payload);
        toast.success("Customer updated successfully");
      } else {
        // Create mode: Call createCustomer cloud function
        const createFn = httpsCallable(functions, "createCustomer");
        await createFn(payload);
        toast.success("Customer added successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? "Edit Customer" : "Add Customer"}
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id="cust-modal-name"
          label="Customer Name *"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cust-modal-phone"
            label="Phone Number *"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
          <Input
            id="cust-modal-email"
            label="Email Address"
            type="email"
            placeholder="e.g. client@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
        </div>
        <div>
          <label htmlFor="cust-modal-address" className="label">Billing Address</label>
          <textarea
            id="cust-modal-address"
            className="input min-h-[80px] resize-none"
            placeholder="Full billing address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="cust-modal-gstin"
            label="GSTIN"
            placeholder="15-char code"
            className="font-mono uppercase"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            error={errors.gstin}
            maxLength={15}
          />
          <Input
            id="cust-modal-pan"
            label="PAN"
            placeholder="10-char PAN"
            className="font-mono uppercase"
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            error={errors.pan}
            maxLength={10}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-green-brand-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving} id="cust-modal-submit">
            {customer ? "Save Changes" : "Add Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
