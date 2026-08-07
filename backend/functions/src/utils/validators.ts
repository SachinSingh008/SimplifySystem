/**
 * Input validation utilities for Cloud Functions.
 */

/**
 * Validates a standard email address.
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Validates an Indian GSTIN (15-character alphanumeric).
 */
export function validateGstin(gstin: string): boolean {
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(gstin.toUpperCase());
}

/**
 * Validates an Indian PAN number.
 */
export function validatePan(pan: string): boolean {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan.toUpperCase());
}

/**
 * Validates a phone number (10-digit Indian mobile).
 */
export function validatePhone(phone: string): boolean {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\s+/g, ""));
}

/**
 * Validates that a value is a non-empty string within a max length.
 */
export function validateString(
  val: unknown,
  maxLen = 500
): val is string {
  return typeof val === "string" && val.trim().length > 0 && val.length <= maxLen;
}

/**
 * Validates a positive number.
 */
export function validatePositiveNumber(val: unknown): val is number {
  return typeof val === "number" && isFinite(val) && val >= 0;
}

/**
 * Validates an invoice status value.
 */
export function validateInvoiceStatus(
  status: string
): status is "draft" | "pending" | "paid" | "cancelled" {
  return ["draft", "pending", "paid", "cancelled"].includes(status);
}

/**
 * Validates a quotation status value.
 */
export function validateQuotationStatus(
  status: string
): status is "open" | "closed" | "cancelled" {
  return ["open", "closed", "cancelled"].includes(status);
}
