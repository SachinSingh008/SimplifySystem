import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateString } from "../utils/validators";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const createInvoice = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const {
    customerId, customerName, customerGstin, items,
    subtotal, cgst, sgst, igst, total,
    paymentMode, upiRef, templateId, notes, terms, dueDate, status,
  } = data;

  if (!validateString(customerName, 200)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid customer name.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "At least one line item is required.");
  }

  // Generate invoice number
  const businessDoc = await db.collection("businesses").doc(userId).get();
  const prefix = businessDoc.exists ? (businessDoc.data()?.invoicePrefix ?? "INV-") : "INV-";
  const count = (await db.collection("invoices").where("userId", "==", userId).count().get()).data().count;
  const invoiceNumber = `${prefix}${String(count + 1).padStart(4, "0")}`;

  const now = FieldValue.serverTimestamp();
  const ref = db.collection("invoices").doc();

  await ref.set({
    userId,
    invoiceNumber,
    status: status ?? "draft",
    customerId: customerId ?? null,
    customerName,
    customerGstin: customerGstin ?? "",
    items,
    subtotal: subtotal ?? 0,
    cgst: cgst ?? 0,
    sgst: sgst ?? 0,
    igst: igst ?? 0,
    total: total ?? 0,
    paymentMode: paymentMode ?? null,
    upiRef: upiRef ?? null,
    templateId: templateId ?? 1,
    notes: notes ?? "",
    terms: terms ?? "",
    dueDate: dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, invoiceId: ref.id, invoiceNumber };
});
