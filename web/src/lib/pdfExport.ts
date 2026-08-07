import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Invoice } from "@/types";

/**
 * Exports an invoice as a PDF by capturing the rendered HTML preview element.
 * @param elementId - ID of the DOM element to capture
 * @param invoice - Invoice data for naming the file
 */
export async function exportInvoicePDF(
  elementId: string,
  invoice: Pick<Invoice, "invoiceNumber" | "customerName">
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const fileName = `${invoice.invoiceNumber}-${invoice.customerName.replace(/\s+/g, "_")}.pdf`;
  pdf.save(fileName);
}

/**
 * Generates a PDF data URI from an element (for preview/print).
 */
export async function getInvoicePDFDataUri(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

  return pdf.output("datauristring");
}
