import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const getCustomers = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { limit = 100 } = data as { limit?: number };

  const snapshot = await db
    .collection("customers")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(Math.min(limit, 200))
    .get();

  const customers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
  }));

  return { success: true, customers };
});
