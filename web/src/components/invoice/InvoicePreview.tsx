import type { Invoice } from "@/types";
import ClassicTemplate from "@/components/templates/ClassicTemplate";
import ModernTemplate from "@/components/templates/ModernTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";

interface Props { invoice: Invoice; }

export default function InvoicePreview({ invoice }: Props) {
  const templates = {
    1: ClassicTemplate,
    2: ModernTemplate,
    3: MinimalTemplate,
  };

  const Template = templates[invoice.templateId] ?? ClassicTemplate;

  return (
    <div id="invoice-preview-root" className="bg-white rounded-xl shadow-card overflow-hidden">
      <Template invoice={invoice} />
    </div>
  );
}
