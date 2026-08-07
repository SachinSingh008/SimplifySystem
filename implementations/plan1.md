# SimplifySystems — Implementation Plan
# Paste each MODULE PROMPT into Cursor/Claude Code one at a time
# Complete one module before moving to the next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 0 — MONOREPO SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Initialize a monorepo called SimplifySystems with this 
exact structure:

SimplifySystems/
├── web/        (Next.js 14 app — DO NOT scaffold yet)
├── app/        (Flutter — DO NOT scaffold yet)
├── backend/    (Firebase — DO NOT scaffold yet)
└── README.md

README.md content:
# SimplifySystems
CRM & Invoice Generator for Indian MSMEs

## Structure
- /web     → Next.js 14 web app
- /app     → Flutter mobile app (v2)
- /backend → Firebase Functions + Firestore

## Quick Start
cd web && npm run dev
cd backend && firebase emulators:start

## Stack
Web: Next.js 14, Tailwind CSS, Framer Motion, Firebase SDK
Backend: Firebase Functions (TypeScript), Firestore, Auth
Mobile: Flutter (planned v2)

Create root .gitignore:
node_modules/
.env*
.env.local
.firebase/
build/
.dart_tool/
*.g.dart
.next/
dist/
functions/lib/

DONE. Do not write any other code yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 1 — BACKEND SETUP (Firebase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/backend/, set up a complete 
Firebase project with TypeScript Cloud Functions.

FOLDER STRUCTURE TO CREATE:
backend/
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        └── utils/
            ├── sendEmail.ts
            ├── otpStore.ts
            └── validators.ts

firebase.json: configure functions, firestore, 
storage, hosting (web as public dir: "../web/out")

firestore.rules:
- All collections require request.auth != null
- users: auth.uid === userId
- businesses, invoices, customers, products, 
  quotations, payments: 
  resource.data.userId === request.auth.uid
- otpTokens: deny all client access

functions/package.json dependencies:
  firebase-admin, firebase-functions,
  nodemailer, bcryptjs, cors
devDependencies:
  typescript, @types/node, @types/bcryptjs,
  @types/nodemailer, ts-node

utils/sendEmail.ts:
  Export async function sendEmail(to, subject, html)
  Uses Nodemailer with Gmail SMTP
  Credentials from env: GMAIL_USER, GMAIL_APP_PASSWORD
  Includes HTML email template with 
  SimplifySystems green branding

utils/otpStore.ts:
  Export async function storeOtp(email, otp)
    - bcrypt hash the OTP
    - store in otpTokens/{email}: {hash, expiresAt, attempts:0}
    - expiresAt = now + 10 minutes
  Export async function verifyOtp(email, otp): boolean
    - get doc otpTokens/{email}
    - check attempts < 5
    - check not expired
    - bcrypt compare
    - increment attempts on fail
    - delete doc on success
    - return true/false

index.ts: export placeholder 
  (will be filled in FILE 2, 3, 4...)

DONE. Do not scaffold web/ yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 2 — AUTH FUNCTIONS (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/backend/functions/src/
create auth/ folder with these two files.
Import and export both from index.ts.

auth/emailOtp.ts:
  Export two HTTPS callable Cloud Functions:

  1. sendOtp(data: {email: string})
     - validate email format
     - generate random 6-digit OTP
     - call storeOtp(email, otp) from otpStore.ts
     - call sendEmail() with this HTML template:
       Subject: "Your SimplifySystems OTP"
       Body: Clean HTML —
         SimplifySystems logo text in #16a34a
         "Your login OTP is:"
         Big bold OTP number in a green box
         "Valid for 10 minutes"
         "If you didn't request this, ignore."
     - return {success: true}
     - on error return {success: false, message}

  2. verifyOtp(data: {email: string, otp: string})
     - call verifyOtp from otpStore.ts
     - if valid: 
         create/get user in Firebase Auth by email
         create custom token with admin.auth()
           .createCustomToken(uid)
         return {success: true, token: customToken}
     - if invalid:
         return {success: false, message: "Invalid OTP"}

auth/onUserCreate.ts:
  Export onCreate Auth trigger:
  When a new user is created in Firebase Auth:
    - Create users/{uid} doc:
        email, displayName, photoURL,
        createdAt: serverTimestamp(), plan: "free"
    - Create businesses/{uid} doc with empty defaults:
        businessName: "", address: "", gstin: "",
        pan: "", logoUrl: "", defaultGstRate: 18,
        invoicePrefix: "INV-", quotationPrefix: "QUO-",
        defaultTerms: "Payment due within 30 days",
        upiId: "", updatedAt: serverTimestamp()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 3 — INVOICE FUNCTIONS (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/backend/functions/src/
create invoices/ folder. Export all from index.ts.

Define TypeScript interface InvoiceItem:
  name: string, hsn: string, qty: number,
  unit: string, rate: number, gstPct: number,
  amount: number

Define TypeScript interface Invoice:
  userId: string
  invoiceNumber: string
  status: "draft" | "pending" | "paid" | "cancelled"
  customerId: string
  customerName: string
  customerAddress: string
  customerGstin: string
  isInterstate: boolean
  items: InvoiceItem[]
  subtotal: number
  cgst: number (0 if interstate)
  sgst: number (0 if interstate)
  igst: number (0 if not interstate)
  total: number
  paymentMode: "cash"|"upi"|"bank"|"cheque"
  upiRef: string
  templateId: 1 | 2 | 3
  notes: string
  terms: string
  invoiceDate: Timestamp
  dueDate: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp

invoices/createInvoice.ts:
  HTTPS callable — createInvoice(data: Partial<Invoice>)
  - verify auth (context.auth)
  - get business doc to fetch invoicePrefix
  - auto-generate invoiceNumber:
      count existing invoices for user + 1
      format: INV-001, INV-002...
  - calculate totals server-side:
      subtotal = sum of (qty * rate) per item
      each item amount = qty * rate
      if isInterstate: igst = subtotal * gstPct/100
      else: cgst = sgst = subtotal * gstPct/100 / 2
      total = subtotal + igst or cgst+sgst
  - add to invoices collection
  - return {invoiceId, invoiceNumber}

invoices/updateInvoice.ts:
  HTTPS callable — updateInvoice({invoiceId, data})
  - verify auth + ownership
  - recalculate totals if items changed
  - update doc + updatedAt

invoices/deleteInvoice.ts:
  HTTPS callable — deleteInvoice({invoiceId})
  - verify auth + ownership
  - only allow delete if status is draft or cancelled
  - soft delete: set status to "cancelled"

invoices/getInvoices.ts:
  HTTPS callable — getInvoices({status?, limit?, startAfter?})
  - verify auth
  - query invoices where userId == uid
  - filter by status if provided
  - order by createdAt desc
  - return array of invoices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 4 — OTHER BACKEND MODULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/backend/functions/src/
create these folders. Export all from index.ts.

customers/createCustomer.ts:
  HTTPS callable — createCustomer(data)
  Fields: userId(from auth), name, email, phone,
  address, gstin, pan
  Add to customers collection
  totalBilled defaults to 0
  return {customerId}

customers/getCustomers.ts:
  HTTPS callable — getCustomers()
  Return all customers where userId == uid
  Order by name asc

products/createProduct.ts:
  HTTPS callable — createProduct(data)
  Fields: userId, name, hsn, unit, price, gstPct
  Add to products collection
  return {productId}

products/getProducts.ts:
  HTTPS callable — getProducts()
  Return all products where userId == uid

quotations/createQuotation.ts:
  Same as createInvoice but:
  - uses quotationPrefix (QUO-)
  - status defaults to "open"
  - adds to quotations collection
  - no upiRef field

quotations/convertToInvoice.ts:
  HTTPS callable — convertToInvoice({quotationId})
  - verify auth + ownership
  - get quotation doc
  - call createInvoice logic with same data
  - update quotation: 
      status: "closed"
      convertedToInvoiceId: new invoiceId
  - return {invoiceId}

payments/logPayment.ts:
  HTTPS callable — logPayment(data)
  Fields: userId, invoiceId, customerId,
  amount, mode, upiRef, date, notes
  - add to payments collection
  - update invoice status to "paid"
  - update customer totalBilled += amount
  - return {paymentId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 5 — NEXT.JS WEB SCAFFOLD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/web/ scaffold a Next.js 14 
app with App Router and these exact settings.

package.json dependencies:
  next@14, react, react-dom, typescript
  tailwindcss, postcss, autoprefixer
  framer-motion
  firebase (client SDK)
  firebase-admin (server only)
  jspdf, html2canvas
  react-hot-toast
  lucide-react
  @types/node, @types/react

tailwind.config.ts:
  extend colors:
    green: { brand: "#16a34a", light: "#22c55e" }
    surface: "#f0fdf4"
  fontFamily:
    heading: ["Poppins", "sans-serif"]
    body: ["DM Sans", "sans-serif"]

src/app/layout.tsx:
  Import Poppins + DM Sans via next/font/google
  Apply to html tag
  Include Toaster from react-hot-toast
  Meta: title "SimplifySystems", 
  description "GST Invoice Generator for Indian MSMEs"

src/types/index.ts:
  Export all TypeScript interfaces:
  User, Business, Invoice, InvoiceItem,
  Customer, Product, Quotation, Payment
  (match exactly the Firestore schema from FILE 1-4)

src/lib/firebase.ts:
  Initialize Firebase client SDK
  Read all config from process.env.NEXT_PUBLIC_FIREBASE_*
  Export: app, auth, db, storage, functions

src/lib/firebaseAdmin.ts:
  Initialize Firebase Admin SDK (server-side only)
  Use FIREBASE_ADMIN_PRIVATE_KEY + CLIENT_EMAIL from env
  Export: adminApp, adminAuth, adminDb

src/context/AuthContext.tsx:
  Wrap app in AuthProvider
  Expose: user, loading, signOut
  Listen to onAuthStateChanged
  Store user in state

src/context/BusinessContext.tsx:
  Fetch businesses/{uid} doc on auth
  Expose: business, updateBusiness, loading

.env.local.example:
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  FIREBASE_ADMIN_PRIVATE_KEY=
  FIREBASE_ADMIN_CLIENT_EMAIL=
  GMAIL_USER=
  GMAIL_APP_PASSWORD=

DONE. Do not build any pages yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 6 — AUTH PAGES (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/web/src/ build the auth flow.

src/lib/auth.ts:
  signInWithGoogle():
    - GoogleAuthProvider + signInWithPopup
    - return user

  sendOtp(email: string):
    - call sendOtp Cloud Function via httpsCallable
    - return {success, message}

  verifyOtpAndLogin(email, otp):
    - call verifyOtp Cloud Function via httpsCallable
    - on success: signInWithCustomToken(token)
    - return {success, user}

  signOut():
    - Firebase signOut

src/app/(auth)/login/page.tsx:
  Design: centered card, white bg, green accents
  SimplifySystems logo + tagline at top

  Section 1 — Google:
    Button: Google icon + "Continue with Google"
    Style: white bg, border, shadow, hover lift
    onClick: signInWithGoogle() then router.push('/dashboard')

  Divider: "or continue with email"

  Section 2 — Email OTP:
    Email input field (placeholder: "Enter your email")
    Button: "Send OTP →" (green primary)
    Loading state on button
    On success: router.push('/verify?email=xxx')
    On error: toast.error(message)

  Bottom: "By continuing you agree to our Terms & Privacy"

src/app/(auth)/verify/page.tsx:
  Read email from searchParams
  
  UI: 
    "Enter OTP" heading
    "Sent to {email}" subtext + "Change" link
    6 individual input boxes (1 digit each)
      - auto-focus first box on load
      - auto-advance to next on input
      - backspace goes to previous
      - paste fills all 6 boxes
    "Verify & Login →" button (green, full width)
    Resend section:
      - 60 second countdown timer
      - "Resend OTP" button (disabled during countdown)
    
  On verify success: router.push('/dashboard')
  On error: shake animation on inputs + toast.error

src/hooks/useAuth.ts:
  Return {user, loading} from AuthContext
  Helper: requireAuth() — redirect to /login if no user

DONE. Do not build dashboard yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 7 — DASHBOARD LAYOUT + SHELL (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/web/src/ build the dashboard 
shell. No page content yet — just layout.

src/app/(dashboard)/layout.tsx:
  - Check auth (redirect to /login if not logged in)
  - Render: <Sidebar /> + <Topbar /> + {children}
  - Mobile: bottom nav instead of sidebar
  - Main content area: ml-64 on desktop, full on mobile

src/components/dashboard/Sidebar.tsx:
  Fixed left sidebar, width 256px, white bg, 
  border-r border-green-100, h-screen

  TOP:
    SimplifySystems logo (green leaf icon + text)

  NAV LINKS (with lucide-react icons):
    /dashboard          LayoutDashboard  "Dashboard"
    /invoices           FileText         "Invoices"
    /quotations         ClipboardList    "Quotations"
    /customers          Users            "Customers"
    /products           Package          "Products"
    /payments           CreditCard       "Payments"
    /settings           Settings         "Settings"

  Active link style: bg-green-50 text-green-700 
    font-medium rounded-lg
  Inactive: text-gray-600 hover:bg-gray-50

  BOTTOM:
    User avatar + name + email
    Sign out button

src/components/dashboard/Topbar.tsx:
  height 64px, white bg, border-b
  Left: current page title (dynamic)
  Right: 
    "+ Create Invoice" button (green, small)
    Notification bell icon
    User avatar (opens dropdown)

src/components/dashboard/StatCard.tsx:
  Props: title, value, icon, color, trend
  Card: white bg, rounded-xl, shadow-sm, 
  border border-green-100
  Icon in colored circle (green/blue/orange/red)
  Value: large bold ₹ formatted number
  Trend: up/down arrow + percentage

DONE. No page content yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 8 — DASHBOARD HOME PAGE (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/(dashboard)/dashboard/page.tsx

Fetch from Firestore on load (useEffect):
  - All invoices for user (useInvoices hook)
  - Business name (useContext BusinessContext)

SECTION 1 — Welcome bar:
  "Good morning, {businessName} 👋"
  Subtext: today's date in DD MMMM YYYY format

SECTION 2 — Stat cards row (4 cards):
  1. Total Revenue: sum of all paid invoices ₹
     Icon: TrendingUp, color: green
  2. Pending: sum of pending invoices ₹
     Icon: Clock, color: orange
  3. Total Invoices: count, Icon: FileText, blue
  4. Customers: count, Icon: Users, purple

SECTION 3 — Quick Actions row:
  3 buttons:
  "+ New Invoice" → /invoices/new
  "+ New Quotation" → /quotations/new
  "+ Add Customer" → /customers (open modal)

SECTION 4 — Recent Invoices table:
  Last 5 invoices
  Columns: Invoice #, Customer, Date, Amount ₹, 
  Status badge, Actions (View, Download)
  Status badge colors:
    paid → green bg
    pending → orange bg
    draft → gray bg
    cancelled → red bg
  "View All Invoices →" link at bottom

src/hooks/useInvoices.ts:
  - Call getInvoices Cloud Function
  - Return {invoices, loading, error, refetch}
  - Cache in useState

src/hooks/useCustomers.ts:
  - Call getCustomers Cloud Function
  - Return {customers, loading, error}

DONE. Do not build invoice form yet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 9 — INVOICE LIST PAGE (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/(dashboard)/invoices/page.tsx

HEADER ROW:
  "Invoices" heading (h1)
  Right: "+ Create Invoice" button → /invoices/new

FILTER TABS:
  All | Pending | Paid | Cancelled | Drafts
  Active tab: green underline + text
  Each tab shows count badge

SEARCH + FILTER BAR:
  Search input: "Search by invoice #, customer..."
  Date range picker: "This Year" dropdown
    Options: This Month, Last Month, 
    This Quarter, This Year, Custom Range
  Actions dropdown: Export CSV, Bulk Delete

TABLE:
  Columns: 
    Checkbox | Amount ₹ | Status | Mode | 
    Invoice # | Customer | Date | Actions
  
  Each row actions (show on hover):
    👁 View | ✉ Send | ⋯ More (Edit, Download PDF,
    Mark as Paid, Cancel, Delete)

  Empty state:
    Illustration + "No invoices found"
    "Create your first invoice →" button

FOOTER ROW:
  Total: ₹X | Paid: ₹X | Pending: ₹X
  Pagination: X/Y pages, prev/next arrows

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 10 — CREATE INVOICE FORM (Web) [CORE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/(dashboard)/invoices/new/page.tsx
and all related components. This is the core feature.

LAYOUT:
  Two-column on desktop:
    Left (60%): Invoice Form
    Right (40%): Live Preview (updates as you type)
  Single column on mobile (preview below form)

src/components/invoice/InvoiceForm.tsx:

  SECTION A — Template Selector:
    3 template cards side by side
    Classic | Modern | Minimal
    Click to select, green border on selected
    Small thumbnail preview in each card

  SECTION B — Business Details:
    Auto-filled from BusinessContext (settings)
    Show: Name, Address, GSTIN, PAN, Logo
    "Edit in Settings →" link

  SECTION C — Customer Details:
    Dropdown: "Select Customer" (from customers list)
      + "Add New Customer" option at bottom of dropdown
    Fields: Name, Address, GSTIN
    Toggle: "Interstate Supply" (affects IGST vs CGST+SGST)

  SECTION D — Invoice Meta:
    Invoice Number: auto-generated, editable
    Invoice Date: date picker (default today)
    Due Date: date picker
    Payment Mode: Cash | UPI | Bank | Cheque
    UPI Reference: text input 
      (shown only when UPI is selected)

  SECTION E — Line Items Table:
    Columns: 
      Item | HSN/SAC | Qty | Unit | 
      Rate ₹ | GST% | Amount ₹ | ✕
    
    Each row:
      Item: searchable dropdown from products catalog
             OR type new item name
      HSN: auto-filled from product, editable
      Qty: number input
      Unit: text (pcs, kg, hrs, etc.)
      Rate ₹: number input
      GST%: dropdown 0/5/12/18/28
      Amount: auto-calculated (qty × rate), read-only
      ✕: remove row button
    
    "+ Add Item" button below table
    First row auto-added on load

  SECTION F — Totals:
    Right-aligned summary box:
    Subtotal:        ₹ X
    CGST (9%):       ₹ X  ← if not interstate
    SGST (9%):       ₹ X  ← if not interstate
    IGST (18%):      ₹ X  ← if interstate
    ─────────────────────
    Total:           ₹ X  (bold, large, green)
    
    Below total:
    "Amount in words: Eighty Nine Thousand..."
    (Indian number system: lakh/crore)

  SECTION G — Notes & Terms:
    Notes: textarea "Additional notes..."
    Terms: textarea (pre-filled from business settings)

  ACTION BAR (sticky bottom):
    Save as Draft | Preview | Download PDF | 
    Save & Send (green primary)

src/lib/invoiceHelpers.ts:
  amountToWords(amount: number): string
    - Indian system: lakh, crore
    - "Eighty Nine Thousand Six Hundred and Eighty Only"
  
  formatINR(amount: number): string
    - ₹1,00,000 format (Indian comma system)
  
  calculateTotals(items, isInterstate):
    - returns {subtotal, cgst, sgst, igst, total}
  
  generateInvoiceNumber(prefix, count):
    - returns "INV-001" padded to 3 digits

src/lib/pdfExport.ts:
  exportInvoicePDF(invoiceId, templateId):
    - use html2canvas on the preview div
    - convert to PDF with jsPDF
    - filename: {invoiceNumber}.pdf
    - download automatically

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 11 — INVOICE TEMPLATES (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build 3 invoice templates in 
src/components/templates/
All accept same props: invoice: Invoice, business: Business
All are print/PDF-ready (A4 width 794px)

ClassicTemplate.tsx:
  White background, full border
  HEADER: green (#16a34a) full-width bar
    Left: Business logo + name + address + GSTIN
    Right: "TAX INVOICE" title + Invoice # + Date
  CUSTOMER BOX: 
    Two columns: "Bill To" (customer) | Invoice meta
    Light green bg box
  ITEMS TABLE:
    Full border table, green header row (white text)
    Columns: #, Description, HSN, Qty, Unit, 
             Rate, GST%, Amount
    Alternating row bg: white / green-50
  TOTALS: right-aligned box with borders
  FOOTER: 
    Bank details | "Authorised Signatory" line
    "Thank you for your business"
    Generated by SimplifySystems watermark

ModernTemplate.tsx:
  Bold design
  HEADER: large green gradient banner (full width)
    Business name large + white text
    "INVOICE" text very large (opacity 20%) watermark
    Invoice # badge top right
  TWO COLUMN: business info | customer info
    Separated by thin green divider
  ITEMS TABLE: 
    No outer border, only row separators
    Green accent on header text
    Rounded row hover
  TOTALS: full-width green box at bottom
    White text, "Total Due: ₹X" very prominent
  FOOTER: minimal, centered

MinimalTemplate.tsx:
  Ultra clean, no colors, typography-driven
  HEADER: 
    Business name (Poppins, large, black)
    Thin gray divider
    Invoice # and date (small, right-aligned)
  CUSTOMER: simple left-aligned text block
  ITEMS TABLE:
    No borders at all
    Only thin bottom divider per row
    Clean column alignment
  TOTALS:
    Right-aligned, thin top border
    Total in slightly larger font
  FOOTER: 
    Small gray text
    SimplifySystems branding

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 12 — CUSTOMERS, PRODUCTS, PAYMENTS PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build these 3 pages inside 
src/app/(dashboard)/

customers/page.tsx:
  Header: "Customers" + "+ Add Customer" button
  Table: Name | Phone | Email | GSTIN | 
         Total Billed ₹ | Actions
  Actions: View invoices, Edit, Delete
  
  Add/Edit Customer Modal:
    Fields: Name*, Phone*, Email, 
    Address, GSTIN, PAN
    Save calls createCustomer Cloud Function

  Click on customer row →
    Side panel slides in (or new page) showing:
    Customer details + all their invoices list

products/page.tsx:
  Header: "Products & Services" + "+ Add Product"
  Table: Name | HSN/SAC | Unit | Price ₹ | GST% | Actions
  Actions: Edit, Delete

  Add/Edit Product Modal:
    Fields: Name*, HSN/SAC, Unit (pcs/kg/hrs/etc),
    Price ₹*, GST Rate* (0/5/12/18/28)
    Save calls createProduct Cloud Function

payments/page.tsx:
  Header: "Payments"
  Table: Invoice # | Customer | Amount ₹ | 
         Mode | Date | UPI Ref | Actions
  
  Log Payment Modal:
    Select Invoice (dropdown of pending invoices)
    Amount ₹ (auto-filled, editable)
    Payment Mode: Cash/UPI/Bank/Cheque
    UPI Ref (if UPI)
    Date (default today)
    Notes
    Save calls logPayment Cloud Function
    → updates invoice to "paid" automatically

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 13 — QUOTATIONS PAGE (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/(dashboard)/quotations/

quotations/page.tsx:
  Identical structure to invoices/page.tsx but:
  - Title: "Quotations"
  - Status tabs: All | Open | Closed | Cancelled | Drafts
  - Extra action on each row: 
    "Convert to Invoice" button (blue)
    onClick: calls convertToInvoice Cloud Function
    On success: toast "Invoice created!" + 
    router.push to new invoice

quotations/new/page.tsx:
  Identical to invoices/new but:
  - Title: "Create Quotation"
  - Invoice Number field replaced with Quotation Number
  - No Payment Mode field
  - No UPI Reference field
  - Save button: "Save Quotation"

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 14 — SETTINGS PAGE (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/(dashboard)/settings/page.tsx

Tabbed layout: 
  Business Profile | Invoice Settings | Account

Tab 1 — Business Profile:
  Logo upload (Firebase Storage, show preview)
  Business Name*
  Address* (textarea)
  GSTIN (15-char validation)
  PAN (10-char validation)
  Phone
  Email
  UPI ID
  Website
  Save button → updates businesses/{uid} in Firestore

Tab 2 — Invoice Settings:
  Invoice Number Prefix (default: INV-)
  Quotation Number Prefix (default: QUO-)
  Default GST Rate dropdown (0/5/12/18/28)
  Default Payment Terms (textarea)
  Default Notes (textarea)
  Default Template (Classic/Modern/Minimal selector)
  Save button

Tab 3 — Account:
  Display name
  Email (read-only)
  Plan: "Free Plan" badge
  Sign out button (red, outlined)
  
  Danger Zone section:
    "Delete Account" button (shows confirmation modal)

DONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 15 — LANDING PAGE (Web)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Build src/app/page.tsx and all landing components
in src/components/landing/
This is the public marketing page.

Navbar.tsx:
  Sticky top, white bg, blur backdrop
  Logo: green leaf icon + "SimplifySystems"
  Links: Features | Templates | How It Works | Pricing
  Right: "Login" (ghost) + "Get Started Free →" (green)
  Mobile: hamburger menu

Hero.tsx:
  Two columns (text left, visual right)
  
  LEFT:
    Badge: "🇮🇳 Built for Indian MSMEs"
    H1: "GST Invoicing made
         ridiculously simple"
    Subtext: "Create professional invoices, track 
    payments, manage customers — all free, forever."
    Buttons: 
      "Start for Free →" (green primary, large)
      "See How It Works" (ghost)
    Trust row: 
      "✓ GST Ready  ✓ UPI Support  
       ✓ PDF Export  ✓ No Credit Card"
  
  RIGHT:
    Animated mockup of a Modern template invoice
    Floating badges around it:
      "✓ Paid" badge floating top-right
      "₹89,680" amount badge
      "GST Calculated" badge bottom-left
  
  Framer Motion: 
    Left content: fadeInLeft
    Right mockup: fadeInRight + float animation

Features.tsx:
  Section title: "Everything you need to run your business"
  6 cards grid (2 cols mobile, 3 cols desktop):
    🧾 Smart Invoicing
       "Create GST invoices in under 60 seconds"
    🎨 Beautiful Templates  
       "3 professional designs, print-ready"
    👥 Customer Management
       "Track every client and their history"
    📦 Product Catalog
       "Reuse items with HSN codes and GST rates"
    💳 Payment Tracking
       "Mark paid, log UPI refs, never miss a payment"
    📋 Quotations
       "Convert quotes to invoices in one click"
  
  Card style: white, green icon bg, hover lift
  Framer: stagger children fadeInUp

Templates.tsx:
  Section: "Choose your invoice style"
  3 side-by-side template preview cards
  Each: thumbnail + name + description + 
  "Use Template" button
  Active template: green border glow

HowItWorks.tsx:
  3 steps with numbers + icons + connecting line
  1️⃣ Setup your business (GSTIN, logo, details)
  2️⃣ Create invoice (customer, items, GST auto-calc)
  3️⃣ Share & get paid (PDF, WhatsApp, UPI)

Stats.tsx:
  Full-width green gradient background
  3 stats with count-up animation on scroll:
  "10,000+" — Invoices Generated
  "500+"    — Businesses Trust Us
  "100%"    — Free Forever

CTA.tsx:
  Centered section
  H2: "Start creating invoices in 60 seconds"
  Big green button: "Launch App — It's Free →"
  onClick: router.push('/login')

Footer.tsx:
  Logo + tagline
  Links: Features, Templates, Login, Privacy, Terms
  Bottom: "Made with ❤️ for Bharat 🇮🇳 
           © 2024 SimplifySystems"

All sections: Framer Motion fadeInUp on scroll
  (use whileInView + viewport once:true)

DONE. This completes the full web app.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 16 — FLUTTER SCAFFOLD (app/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT:
Inside SimplifySystems/app/ create a minimal 
Flutter project scaffold.

pubspec.yaml:
  name: simplify_systems
  description: SimplifySystems Mobile — v2
  dependencies:
    flutter sdk
    firebase_core: latest
    firebase_auth: latest
    cloud_firestore: latest
  
lib/main.dart:
  MaterialApp with green theme (#16a34a)
  Single screen: 
    SimplifySystems logo (green)
    "Mobile App Coming Soon"
    "The full experience is live on web →"
    URL: your web URL
    Green "Visit Web App" button

README.md inside app/:
  # SimplifySystems Mobile (v2)
  Flutter app — in development
  Same Firebase backend as web/
  Auth: OTP + Google OAuth
  Shares all Firestore collections with web

DONE. Flutter v2 roadmap complete.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 0  → Monorepo root setup
FILE 1  → Firebase backend scaffold + utils
FILE 2  → Auth Cloud Functions (OTP + Google)
FILE 3  → Invoice Cloud Functions
FILE 4  → Customer/Product/Quotation/Payment Functions
FILE 5  → Next.js web scaffold + Firebase config
FILE 6  → Auth pages (Login + OTP Verify)
FILE 7  → Dashboard layout + Sidebar + Topbar
FILE 8  → Dashboard home page
FILE 9  → Invoice list page
FILE 10 → Create invoice form (core)
FILE 11 → 3 Invoice templates
FILE 12 → Customers + Products + Payments pages
FILE 13 → Quotations page
FILE 14 → Settings page
FILE 15 → Landing page
FILE 16 → Flutter scaffold

TEST AFTER EACH FILE before moving to next.
Deploy order: backend → web → app