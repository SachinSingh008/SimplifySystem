# SimplifySystems

> **GST-compliant Indian invoicing platform** — manage invoices, quotations, customers, and products with ease.

---

## Monorepo Structure

```
SimplifySystems/
├── web/          # Next.js 14 web app (primary product)
├── app/          # Flutter mobile app (v2 roadmap)
├── backend/      # Firebase project (Functions, Firestore, Auth, Storage)
└── README.md
```

---

## Sub-Projects

### 🌐 `web/` — Next.js 14 Web App

Full-featured invoicing dashboard built with Next.js 14 App Router, Tailwind CSS, Firebase Client SDK, and Framer Motion.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Firebase · Framer Motion

```bash
cd web
cp .env.local.example .env.local   # fill in your Firebase credentials
npm install
npm run dev                         # runs on http://localhost:3000
```

### 🔥 `backend/` — Firebase Project

Cloud Functions (Node 18, TypeScript), Firestore, Firebase Auth, Firebase Storage.

**Stack:** Firebase Functions · TypeScript · Node 18 · Nodemailer

```bash
cd backend/functions
npm install

# To start local emulators:
cd ..
firebase emulators:start

# To deploy:
firebase deploy
```

> **Prerequisites:** Install the Firebase CLI — `npm install -g firebase-tools` then `firebase login`

### 📱 `app/` — Flutter App (v2 Roadmap)

Placeholder Flutter project. Full mobile app coming in v2.

```bash
cd app
flutter pub get
flutter run        # shows "Coming Soon" screen
```

---

## Firebase Services

| Service | Usage |
|---|---|
| **Firestore** | Primary database — users, invoices, customers, products, quotations, payments |
| **Firebase Auth** | Google OAuth + Custom Token (Email OTP) |
| **Firebase Storage** | Business logo uploads, generated PDF storage |
| **Cloud Functions** | Business logic, OTP email dispatch, PDF generation |
| **Firebase Hosting** | Optional — deploy the Next.js app via `firebase deploy --only hosting` |

---

## Environment Variables

Copy `web/.env.local.example` to `web/.env.local` and fill in:

```
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
```

---

## Design System

| Token | Value |
|---|---|
| Primary | `#16a34a` (green-600) |
| Accent | `#22c55e` (green-500) |
| Background | `#ffffff` |
| Surface | `#f0fdf4` (green-50) |
| Heading Font | Poppins |
| Body Font | DM Sans |
| Currency | ₹ INR |
| Date Format | DD/MM/YYYY |
| Number Format | Indian lakh/crore system |

---

## License

MIT © SimplifySystems
# SimplifySystem
