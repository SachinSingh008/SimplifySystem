import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateString } from "../utils/validators";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const createQuotation = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const {
    customerId, customerName, customerGstin, items,
    subtotal, cgst, sgst, igst, total,
    templateId, notes, terms, dueDate,
  } = data;

  if (!validateString(customerName, 200)) {
    throw new functions.https.HttpsError("invalid-argument", "Customer name is required.");
  }

  const businessDoc = await db.collection("businesses").doc(userId).get();
  const prefix = businessDoc.exists ? (businessDoc.data()?.quotationPrefix ?? "QUO-") : "QUO-";
  const count = (await db.collection("quotations").where("userId", "==", userId).count().get()).data().count;
  const quotationNumber = `${prefix}${String(count + 1).padStart(4, "0")}`;

  const now = FieldValue.serverTimestamp();
  const ref = db.collection("quotations").doc();

  await ref.set({
    userId,
    quotationNumber,
    status: "open",
    customerId: customerId ?? null,
    customerName,
    customerGstin: customerGstin ?? "",
    items,
    subtotal: subtotal ?? 0,
    cgst: cgst ?? 0,
    sgst: sgst ?? 0,
    igst: igst ?? 0,
    total: total ?? 0,
    templateId: templateId ?? 1,
    notes: notes ?? "",
    terms: terms ?? "",
    dueDate: dueDate ?? null,
    convertedToInvoiceId: null,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, quotationId: ref.id, quotationNumber };
});
