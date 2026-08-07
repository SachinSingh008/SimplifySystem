import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const privateKey = process.env.FB_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FB_ADMIN_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    admin.initializeApp();
  }
}

// Auth
export { sendOtp, verifyOtp } from "./auth/emailOtp";
export { onUserCreate } from "./auth/onUserCreate";

// Invoices
export { createInvoice } from "./invoices/createInvoice";
export { updateInvoice } from "./invoices/updateInvoice";
export { deleteInvoice } from "./invoices/deleteInvoice";
export { getInvoices } from "./invoices/getInvoices";

// Customers
export { createCustomer } from "./customers/createCustomer";
export { getCustomers } from "./customers/getCustomers";

// Products
export { createProduct } from "./products/createProduct";
export { getProducts } from "./products/getProducts";

// Quotations
export { createQuotation } from "./quotations/createQuotation";
export { convertToInvoice } from "./quotations/convertToInvoice";

// Payments
export { logPayment } from "./payments/logPayment";

// PDF
export { generateInvoicePDF } from "./pdf/generateInvoicePDF";
