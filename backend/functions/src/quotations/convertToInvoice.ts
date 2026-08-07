import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const convertToInvoice = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { quotationId } = data as { quotationId: string };

  if (!quotationId) {
    throw new functions.https.HttpsError("invalid-argument", "quotationId is required.");
  }

  const quotRef = db.collection("quotations").doc(quotationId);
  const quotDoc = await quotRef.get();

  if (!quotDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Quotation not found.");
  }
  const quotData = quotDoc.data()!;
  if (quotData.userId !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Access denied.");
  }
  if (quotData.convertedToInvoiceId) {
    throw new functions.https.HttpsError("already-exists", "Quotation already converted to an invoice.");
  }

  // Auto-generate invoice number
  const businessDoc = await db.collection("businesses").doc(userId).get();
  const prefix = businessDoc.exists ? (businessDoc.data()?.invoicePrefix ?? "INV-") : "INV-";
  const count = (await db.collection("invoices").where("userId", "==", userId).count().get()).data().count;
  const invoiceNumber = `${prefix}${String(count + 1).padStart(4, "0")}`;

  const now = FieldValue.serverTimestamp();
  const invoiceRef = db.collection("invoices").doc();

  const batch = db.batch();

  // Create invoice from quotation data
  batch.set(invoiceRef, {
    userId,
    invoiceNumber,
    status: "draft",
    customerId: quotData.customerId,
    customerName: quotData.customerName,
    customerGstin: quotData.customerGstin,
    items: quotData.items,
    subtotal: quotData.subtotal,
    cgst: quotData.cgst,
    sgst: quotData.sgst,
    igst: quotData.igst,
    total: quotData.total,
    templateId: quotData.templateId,
    notes: quotData.notes,
    terms: quotData.terms,
    dueDate: quotData.dueDate,
    paymentMode: null,
    upiRef: null,
    createdAt: now,
    updatedAt: now,
  });

  // Mark quotation as closed and reference the invoice
  batch.update(quotRef, {
    status: "closed",
    convertedToInvoiceId: invoiceRef.id,
    updatedAt: now,
  });

  await batch.commit();

  return { success: true, invoiceId: invoiceRef.id, invoiceNumber };
});
