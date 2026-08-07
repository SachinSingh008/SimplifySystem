import 'package:cloud_functions/cloud_functions.dart';

/// Calls Firebase Cloud Functions (same as web app)
/// Region: asia-south1
class FunctionsService {
  final _fn = FirebaseFunctions.instanceFor(region: 'asia-south1');

  HttpsCallable _call(String name) => _fn.httpsCallable(name);

  // ── Invoices ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createInvoice(Map<String, dynamic> payload) async {
    final result = await _call('createInvoice').call(payload);
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<void> updateInvoice(String invoiceId, Map<String, dynamic> updates) async {
    await _call('updateInvoice').call({'invoiceId': invoiceId, 'updates': updates});
  }

  Future<void> updateInvoiceStatus(String invoiceId, String status) async {
    await _call('updateInvoiceStatus').call({'invoiceId': invoiceId, 'status': status});
  }

  Future<void> deleteInvoice(String invoiceId) async {
    await _call('deleteInvoice').call({'invoiceId': invoiceId});
  }

  // ── Quotations ─────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createQuotation(Map<String, dynamic> payload) async {
    final result = await _call('createQuotation').call(payload);
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<void> updateQuotation(String quotationId, Map<String, dynamic> updates) async {
    await _call('updateQuotation').call({'quotationId': quotationId, 'updates': updates});
  }

  Future<Map<String, dynamic>> convertQuotationToInvoice(String quotationId) async {
    final result = await _call('convertQuotationToInvoice').call({'quotationId': quotationId});
    return Map<String, dynamic>.from(result.data as Map);
  }

  // ── Customers ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createCustomer(Map<String, dynamic> payload) async {
    final result = await _call('createCustomer').call(payload);
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<void> updateCustomer(String customerId, Map<String, dynamic> updates) async {
    await _call('updateCustomer').call({'customerId': customerId, 'updates': updates});
  }

  Future<void> deleteCustomer(String customerId) async {
    await _call('deleteCustomer').call({'customerId': customerId});
  }

  // ── Products ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> payload) async {
    final result = await _call('createProduct').call(payload);
    return Map<String, dynamic>.from(result.data as Map);
  }

  Future<void> updateProduct(String productId, Map<String, dynamic> updates) async {
    await _call('updateProduct').call({'productId': productId, 'updates': updates});
  }

  Future<void> deleteProduct(String productId) async {
    await _call('deleteProduct').call({'productId': productId});
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> recordPayment(Map<String, dynamic> payload) async {
    final result = await _call('recordPayment').call(payload);
    return Map<String, dynamic>.from(result.data as Map);
  }
}
