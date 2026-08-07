import { Poppins, DM_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BusinessProvider } from "@/context/BusinessContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SimplifySystems — GST Invoice Management for Indian Businesses",
  description:
    "Create professional GST invoices, manage customers, track payments, and generate PDFs — all in one place. Built for Indian businesses.",
  keywords: [
    "GST invoice", "invoice generator", "Indian billing software",
    "quotation maker", "payment tracker", "small business India",
  ],
  openGraph: {
    title: "SimplifySystems — GST Invoice Management",
    description: "Professional invoicing for Indian businesses",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable}`}>
      <body className="font-dm-sans bg-white text-navy-brand-900 antialiased">
        <AuthProvider>
          <BusinessProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontFamily: "var(--font-dm-sans)",
                  borderRadius: "0.75rem",
                  border: "1px solid #dcfce7",
                },
                success: {
                  iconTheme: { primary: "#16a34a", secondary: "#fff" },
                },
              }}
            />
          </BusinessProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
