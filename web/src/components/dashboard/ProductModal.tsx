"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, updateDoc } from "firebase/firestore";
import { functions, db } from "@/lib/firebase";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import type { Product } from "@/types";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null; // If provided, we are in Edit mode
}

const UNITS = ["Nos", "Hrs", "Days", "Kg", "Ltr", "Mtr", "Sqft", "Pcs"];
const GST_RATES = [0, 5, 12, 18, 28];

export default function ProductModal({ open, onClose, product }: ProductModalProps) {
  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [unit, setUnit] = useState("Nos");
  const [price, setPrice] = useState("");
  const [gstPct, setGstPct] = useState(18);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name ?? "");
      setHsn(product.hsn ?? "");
      setUnit(product.unit ?? "Nos");
      setPrice(String(product.price ?? ""));
      setGstPct(product.gstPct ?? 18);
    } else {
      setName("");
      setHsn("");
      setUnit("Nos");
      setPrice("");
      setGstPct(18);
    }
    setErrors({});
  }, [product, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Valid price is required";
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
        hsn: hsn.trim(),
        unit,
        price: Number(price),
        gstPct: Number(gstPct),
      };

      if (product) {
        // Edit mode: Update Firestore document directly
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, payload);
        toast.success("Product updated successfully");
      } else {
        // Create mode: Call createProduct cloud function
        const createFn = httpsCallable(functions, "createProduct");
        await createFn(payload);
        toast.success("Product added successfully");
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
      title={product ? "Edit Product / Service" : "Add Product / Service"}
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id="prod-modal-name"
          label="Product / Service Name *"
          placeholder="e.g. Software Development"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="prod-modal-hsn"
            label="HSN / SAC Code"
            placeholder="e.g. 998311"
            value={hsn}
            onChange={(e) => setHsn(e.target.value)}
            error={errors.hsn}
          />
          <div>
            <label htmlFor="prod-modal-unit" className="label">Unit</label>
            <select
              id="prod-modal-unit"
              className="input"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="prod-modal-price"
            label="Base Price (₹) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
          />
          <div>
            <label htmlFor="prod-modal-gst" className="label">GST Rate (%)</label>
            <select
              id="prod-modal-gst"
              className="input"
              value={gstPct}
              onChange={(e) => setGstPct(Number(e.target.value))}
            >
              {GST_RATES.map((g) => (
                <option key={g} value={g}>{g}%</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-green-brand-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving} id="prod-modal-submit">
            {product ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
