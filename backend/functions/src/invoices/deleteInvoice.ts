import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const deleteInvoice = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { invoiceId } = data as { invoiceId: string };

  if (!invoiceId) {
    throw new functions.https.HttpsError("invalid-argument", "invoiceId is required.");
  }

  const ref = db.collection("invoices").doc(invoiceId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new functions.https.HttpsError("not-found", "Invoice not found.");
  }
  if (doc.data()?.userId !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Access denied.");
  }

  await ref.delete();
  return { success: true };
});
