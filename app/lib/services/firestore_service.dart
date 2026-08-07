import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';

class FirestoreService {
  final _db = FirebaseFirestore.instance;

  String get _uid => FirebaseAuth.instance.currentUser!.uid;

  // ── Invoices ───────────────────────────────────────────────────────────────
  Stream<List<Invoice>> watchInvoices() => _db
      .collection('invoices')
      .where('userId', isEqualTo: _uid)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((s) => s.docs
          .map((d) => Invoice.fromMap(d.id, d.data()))
          .toList());

  Future<Invoice?> getInvoice(String id) async {
    final d = await _db.collection('invoices').doc(id).get();
    if (!d.exists) return null;
    return Invoice.fromMap(d.id, d.data()!);
  }

  // ── Quotations ─────────────────────────────────────────────────────────────
  Stream<List<Quotation>> watchQuotations() => _db
      .collection('quotations')
      .where('userId', isEqualTo: _uid)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((s) => s.docs
          .map((d) => Quotation.fromMap(d.id, d.data()))
          .toList());

  // ── Customers ──────────────────────────────────────────────────────────────
  Stream<List<Customer>> watchCustomers() => _db
      .collection('customers')
      .where('userId', isEqualTo: _uid)
      .orderBy('name')
      .snapshots()
      .map((s) => s.docs
          .map((d) => Customer.fromMap(d.id, d.data()))
          .toList());

  Future<Customer?> getCustomer(String id) async {
    final d = await _db.collection('customers').doc(id).get();
    if (!d.exists) return null;
    return Customer.fromMap(d.id, d.data()!);
  }

  // ── Products ───────────────────────────────────────────────────────────────
  Stream<List<Product>> watchProducts() => _db
      .collection('products')
      .where('userId', isEqualTo: _uid)
      .orderBy('name')
      .snapshots()
      .map((s) => s.docs
          .map((d) => Product.fromMap(d.id, d.data()))
          .toList());

  // ── Payments ───────────────────────────────────────────────────────────────
  Stream<List<Payment>> watchPayments() => _db
      .collection('payments')
      .where('userId', isEqualTo: _uid)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((s) => s.docs
          .map((d) => Payment.fromMap(d.id, d.data()))
          .toList());

  // ── Business / Settings ────────────────────────────────────────────────────
  Stream<Business?> watchBusiness() => _db
      .collection('businesses')
      .doc(_uid)
      .snapshots()
      .map((d) => d.exists ? Business.fromMap(d.data()!) : null);

  Future<void> saveBusiness(Map<String, dynamic> data) => _db
      .collection('businesses')
      .doc(_uid)
      .set(data, SetOptions(merge: true));

  // ── Customer invoices ──────────────────────────────────────────────────────
  Stream<List<Invoice>> watchCustomerInvoices(String customerId) => _db
      .collection('invoices')
      .where('userId', isEqualTo: _uid)
      .where('customerId', isEqualTo: customerId)
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((s) => s.docs
          .map((d) => Invoice.fromMap(d.id, d.data()))
          .toList());
}
