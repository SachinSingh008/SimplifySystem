// src/types/index.ts

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: "free" | "pro";
  createdAt: string;
}

export interface Business {
  businessName: string;
  address: string;
  gstin: string;
  pan: string;
  logoUrl: string | null;
  defaultGstRate: number;
  invoicePrefix: string;
  quotationPrefix: string;
  defaultTerms: string;
  upiId: string;
  updatedAt: string;
}

export interface InvoiceItem {
  name: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  gstPct: number;
  amount: number;
}

export type InvoiceStatus = "draft" | "pending" | "paid" | "cancelled";

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  customerId: string | null;
  customerName: string;
  customerGstin: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentMode: string | null;
  upiRef: string | null;
  templateId: 1 | 2 | 3;
  notes: string;
  terms: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  pan: string | null;
  totalBilled: number;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  hsn: string;
  unit: string;
  price: number;
  gstPct: number;
  createdAt: string;
}

export type QuotationStatus = "open" | "closed" | "cancelled";

export interface Quotation {
  id: string;
  userId: string;
  quotationNumber: string;
  status: QuotationStatus;
  customerId: string | null;
  customerName: string;
  customerGstin: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  templateId: 1 | 2 | 3;
  notes: string;
  terms: string;
  dueDate: string | null;
  convertedToInvoiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  invoiceId: string;
  customerId: string | null;
  amount: number;
  mode: "cash" | "upi" | "bank" | "cheque" | "other";
  upiRef: string | null;
  date: string;
  notes: string;
  createdAt: string;
}

export interface OtpToken {
  hashedOtp: string;
  expiresAt: string;
  attempts: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  pendingAmount: number;
}
