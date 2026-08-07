import type { InvoiceItem } from "@/types";

// ── Invoice Number Generation ─────────────────────────────────────────────────

export function generateInvoiceNumber(prefix: string, count: number): string {
  return `${prefix}${String(count).padStart(4, "0")}`;
}

// ── GST Calculations ──────────────────────────────────────────────────────────

export interface GstBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

/**
 * Calculates GST breakdown for a list of line items.
 * @param items Line items with amount and gstPct
 * @param isInterstate If true, uses IGST instead of CGST+SGST
 */
export function calculateGst(
  items: InvoiceItem[],
  isInterstate = false
): GstBreakdown {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  if (isInterstate) {
    const igst = items.reduce(
      (sum, item) => sum + (item.amount * item.gstPct) / 100,
      0
    );
    return {
      subtotal: round2(subtotal),
      cgst: 0,
      sgst: 0,
      igst: round2(igst),
      total: round2(subtotal + igst),
    };
  }

  const totalGst = items.reduce(
    (sum, item) => sum + (item.amount * item.gstPct) / 100,
    0
  );
  const halfGst = totalGst / 2;

  return {
    subtotal: round2(subtotal),
    cgst: round2(halfGst),
    sgst: round2(halfGst),
    igst: 0,
    total: round2(subtotal + totalGst),
  };
}

export function calculateLineItemAmount(
  qty: number,
  rate: number
): number {
  return round2(qty * rate);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Indian Amount in Words ────────────────────────────────────────────────────

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function wordsBelow100(n: number): string {
  if (n < 20) return ones[n];
  return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`;
}

function wordsBelow1000(n: number): string {
  if (n < 100) return wordsBelow100(n);
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? " " + wordsBelow100(n % 100) : ""}`;
}

/**
 * Converts a rupee amount to Indian words format.
 * e.g. 1,23,456.78 → "One Lakh Twenty Three Thousand Four Hundred Fifty Six Rupees and Seventy Eight Paise"
 */
export function amountInWords(amount: number): string {
  if (amount === 0) return "Zero Rupees Only";

  const [rupeeStr, paiseStr = "00"] = amount.toFixed(2).split(".");
  const rupees = parseInt(rupeeStr, 10);
  const paise = parseInt(paiseStr.padEnd(2, "0").slice(0, 2), 10);

  function convertRupees(n: number): string {
    if (n === 0) return "";
    if (n < 1000) return wordsBelow1000(n);

    const crore = Math.floor(n / 10_000_000);
    const lakh = Math.floor((n % 10_000_000) / 100_000);
    const thousand = Math.floor((n % 100_000) / 1_000);
    const remainder = n % 1_000;

    const parts: string[] = [];
    if (crore) parts.push(`${wordsBelow1000(crore)} Crore`);
    if (lakh) parts.push(`${wordsBelow100(lakh)} Lakh`);
    if (thousand) parts.push(`${wordsBelow1000(thousand)} Thousand`);
    if (remainder) parts.push(wordsBelow1000(remainder));
    return parts.join(" ");
  }

  const rupeeWords = convertRupees(rupees);
  const paiseWords = paise > 0 ? ` and ${wordsBelow100(paise)} Paise` : "";
  return `${rupeeWords} Rupees${paiseWords} Only`;
}

// ── Indian Number Formatting ──────────────────────────────────────────────────

/**
 * Formats a number in the Indian lakh/crore system.
 * e.g. 1234567 → "12,34,567"
 */
export function formatIndianNumber(n: number): string {
  const str = Math.round(n).toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

export function formatCurrency(amount: number): string {
  return `₹${formatIndianNumber(amount)}`;
}

// ── Date Formatting ───────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
