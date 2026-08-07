import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import '../services/firestore_service.dart';
import '../services/functions_service.dart';

// ── Singletons ─────────────────────────────────────────────────────────────
final firestoreServiceProvider = Provider<FirestoreService>((_) => FirestoreService());
final functionsServiceProvider = Provider<FunctionsService>((_) => FunctionsService());

// ── Auth ───────────────────────────────────────────────────────────────────
final authStateProvider = StreamProvider<User?>(
  (_) => FirebaseAuth.instance.authStateChanges(),
);

// ── Invoices ───────────────────────────────────────────────────────────────
final invoicesProvider = StreamProvider<List<Invoice>>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchInvoices();
});

final invoiceDetailProvider =
    FutureProvider.family<Invoice?, String>((ref, id) async {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.getInvoice(id);
});

// ── Quotations ─────────────────────────────────────────────────────────────
final quotationsProvider = StreamProvider<List<Quotation>>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchQuotations();
});

// ── Customers ──────────────────────────────────────────────────────────────
final customersProvider = StreamProvider<List<Customer>>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchCustomers();
});

final customerDetailProvider =
    FutureProvider.family<Customer?, String>((ref, id) async {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.getCustomer(id);
});

final customerInvoicesProvider =
    StreamProvider.family<List<Invoice>, String>((ref, customerId) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchCustomerInvoices(customerId);
});

// ── Products ───────────────────────────────────────────────────────────────
final productsProvider = StreamProvider<List<Product>>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchProducts();
});

// ── Payments ───────────────────────────────────────────────────────────────
final paymentsProvider = StreamProvider<List<Payment>>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchPayments();
});

// ── Business ───────────────────────────────────────────────────────────────
final businessProvider = StreamProvider<Business?>((ref) {
  final svc = ref.watch(firestoreServiceProvider);
  return svc.watchBusiness();
});

// ── Dashboard Stats (derived) ──────────────────────────────────────────────
final dashboardStatsProvider = Provider((ref) {
  final invoices = ref.watch(invoicesProvider).value ?? [];
  final customers = ref.watch(customersProvider).value ?? [];
  final totalRevenue = invoices
      .where((i) => i.status == InvoiceStatus.paid)
      .fold<double>(0, (s, i) => s + i.total);
  final pendingAmount = invoices
      .where((i) => i.status == InvoiceStatus.pending)
      .fold<double>(0, (s, i) => s + i.total);
  return (
    totalRevenue: totalRevenue,
    totalInvoices: invoices.length,
    totalCustomers: customers.length,
    pendingAmount: pendingAmount,
  );
});
