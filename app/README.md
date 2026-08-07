# SimplifySystems — Flutter App

> **v2 Roadmap** — Full mobile app coming in the next major version.

## Planned Features (v2)

- [ ] Google & Email OTP login (same Firebase backend)
- [ ] Invoice creation with GST auto-calculation
- [ ] Customer & product management
- [ ] PDF export and share
- [ ] Push notifications for payment reminders
- [ ] Offline-first with Firestore local cache
- [ ] UPI payment deeplink integration

## Running the Placeholder

```bash
flutter pub get
flutter run
```

Requires Flutter SDK ≥ 3.10.

## Tech Stack (Planned)

| Layer | Technology |
|---|---|
| Framework | Flutter 3.x |
| State Management | Riverpod |
| Backend | Same Firebase project as `web/` |
| PDF | `pdf` package |
| Auth | `firebase_auth` + custom token |
