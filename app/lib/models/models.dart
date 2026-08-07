// Data models — mirrors web src/types/index.ts exactly

class InvoiceItem {
  final String name;
  final String hsn;
  final double qty;
  final String unit;
  final double rate;
  final double gstPct;
  final double amount;

  const InvoiceItem({
    required this.name,
    required this.hsn,
    required this.qty,
    required this.unit,
    required this.rate,
    required this.gstPct,
    required this.amount,
  });

  factory InvoiceItem.fromMap(Map<String, dynamic> m) => InvoiceItem(
        name: m['name'] as String? ?? '',
        hsn: m['hsn'] as String? ?? '',
        qty: (m['qty'] as num?)?.toDouble() ?? 1,
        unit: m['unit'] as String? ?? 'Nos',
        rate: (m['rate'] as num?)?.toDouble() ?? 0,
        gstPct: (m['gstPct'] as num?)?.toDouble() ?? 18,
        amount: (m['amount'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'hsn': hsn,
        'qty': qty,
        'unit': unit,
        'rate': rate,
        'gstPct': gstPct,
        'amount': amount,
      };

  InvoiceItem copyWith({
    String? name,
    String? hsn,
    double? qty,
    String? unit,
    double? rate,
    double? gstPct,
    double? amount,
  }) =>
      InvoiceItem(
        name: name ?? this.name,
        hsn: hsn ?? this.hsn,
        qty: qty ?? this.qty,
        unit: unit ?? this.unit,
        rate: rate ?? this.rate,
        gstPct: gstPct ?? this.gstPct,
        amount: amount ?? this.amount,
      );
}

enum InvoiceStatus { draft, pending, paid, cancelled }

extension InvoiceStatusX on InvoiceStatus {
  String get label => name;
  static InvoiceStatus fromString(String s) =>
      InvoiceStatus.values.firstWhere((e) => e.name == s,
          orElse: () => InvoiceStatus.draft);
}

class Invoice {
  final String id;
  final String userId;
  final String invoiceNumber;
  final InvoiceStatus status;
  final String? customerId;
  final String customerName;
  final String customerGstin;
  final List<InvoiceItem> items;
  final double subtotal;
  final double cgst;
  final double sgst;
  final double igst;
  final double total;
  final String? paymentMode;
  final String? upiRef;
  final int templateId;
  final String notes;
  final String terms;
  final String? dueDate;
  final String createdAt;
  final String updatedAt;

  const Invoice({
    required this.id,
    required this.userId,
    required this.invoiceNumber,
    required this.status,
    this.customerId,
    required this.customerName,
    required this.customerGstin,
    required this.items,
    required this.subtotal,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.total,
    this.paymentMode,
    this.upiRef,
    required this.templateId,
    required this.notes,
    required this.terms,
    this.dueDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Invoice.fromMap(String id, Map<String, dynamic> m) => Invoice(
        id: id,
        userId: m['userId'] as String? ?? '',
        invoiceNumber: m['invoiceNumber'] as String? ?? '',
        status: InvoiceStatusX.fromString(m['status'] as String? ?? 'draft'),
        customerId: m['customerId'] as String?,
        customerName: m['customerName'] as String? ?? '',
        customerGstin: m['customerGstin'] as String? ?? '',
        items: (m['items'] as List<dynamic>? ?? [])
            .map((e) => InvoiceItem.fromMap(Map<String, dynamic>.from(e)))
            .toList(),
        subtotal: (m['subtotal'] as num?)?.toDouble() ?? 0,
        cgst: (m['cgst'] as num?)?.toDouble() ?? 0,
        sgst: (m['sgst'] as num?)?.toDouble() ?? 0,
        igst: (m['igst'] as num?)?.toDouble() ?? 0,
        total: (m['total'] as num?)?.toDouble() ?? 0,
        paymentMode: m['paymentMode'] as String?,
        upiRef: m['upiRef'] as String?,
        templateId: (m['templateId'] as num?)?.toInt() ?? 1,
        notes: m['notes'] as String? ?? '',
        terms: m['terms'] as String? ?? '',
        dueDate: m['dueDate'] as String?,
        createdAt: m['createdAt'] as String? ?? '',
        updatedAt: m['updatedAt'] as String? ?? '',
      );
}

class Customer {
  final String id;
  final String userId;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? gstin;
  final String? pan;
  final double totalBilled;
  final String createdAt;

  const Customer({
    required this.id,
    required this.userId,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.gstin,
    this.pan,
    required this.totalBilled,
    required this.createdAt,
  });

  factory Customer.fromMap(String id, Map<String, dynamic> m) => Customer(
        id: id,
        userId: m['userId'] as String? ?? '',
        name: m['name'] as String? ?? '',
        email: m['email'] as String?,
        phone: m['phone'] as String?,
        address: m['address'] as String?,
        gstin: m['gstin'] as String?,
        pan: m['pan'] as String?,
        totalBilled: (m['totalBilled'] as num?)?.toDouble() ?? 0,
        createdAt: m['createdAt'] as String? ?? '',
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'email': email,
        'phone': phone,
        'address': address,
        'gstin': gstin,
        'pan': pan,
        'totalBilled': totalBilled,
        'createdAt': createdAt,
      };
}

class Product {
  final String id;
  final String userId;
  final String name;
  final String hsn;
  final String unit;
  final double price;
  final double gstPct;
  final String createdAt;

  const Product({
    required this.id,
    required this.userId,
    required this.name,
    required this.hsn,
    required this.unit,
    required this.price,
    required this.gstPct,
    required this.createdAt,
  });

  factory Product.fromMap(String id, Map<String, dynamic> m) => Product(
        id: id,
        userId: m['userId'] as String? ?? '',
        name: m['name'] as String? ?? '',
        hsn: m['hsn'] as String? ?? '',
        unit: m['unit'] as String? ?? 'Nos',
        price: (m['price'] as num?)?.toDouble() ?? 0,
        gstPct: (m['gstPct'] as num?)?.toDouble() ?? 18,
        createdAt: m['createdAt'] as String? ?? '',
      );
}

enum QuotationStatus { open, closed, cancelled }

extension QuotationStatusX on QuotationStatus {
  String get label => name;
  static QuotationStatus fromString(String s) =>
      QuotationStatus.values.firstWhere((e) => e.name == s,
          orElse: () => QuotationStatus.open);
}

class Quotation {
  final String id;
  final String userId;
  final String quotationNumber;
  final QuotationStatus status;
  final String? customerId;
  final String customerName;
  final String customerGstin;
  final List<InvoiceItem> items;
  final double subtotal;
  final double cgst;
  final double sgst;
  final double igst;
  final double total;
  final int templateId;
  final String notes;
  final String terms;
  final String? dueDate;
  final String? convertedToInvoiceId;
  final String createdAt;
  final String updatedAt;

  const Quotation({
    required this.id,
    required this.userId,
    required this.quotationNumber,
    required this.status,
    this.customerId,
    required this.customerName,
    required this.customerGstin,
    required this.items,
    required this.subtotal,
    required this.cgst,
    required this.sgst,
    required this.igst,
    required this.total,
    required this.templateId,
    required this.notes,
    required this.terms,
    this.dueDate,
    this.convertedToInvoiceId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Quotation.fromMap(String id, Map<String, dynamic> m) => Quotation(
        id: id,
        userId: m['userId'] as String? ?? '',
        quotationNumber: m['quotationNumber'] as String? ?? '',
        status: QuotationStatusX.fromString(m['status'] as String? ?? 'open'),
        customerId: m['customerId'] as String?,
        customerName: m['customerName'] as String? ?? '',
        customerGstin: m['customerGstin'] as String? ?? '',
        items: (m['items'] as List<dynamic>? ?? [])
            .map((e) => InvoiceItem.fromMap(Map<String, dynamic>.from(e)))
            .toList(),
        subtotal: (m['subtotal'] as num?)?.toDouble() ?? 0,
        cgst: (m['cgst'] as num?)?.toDouble() ?? 0,
        sgst: (m['sgst'] as num?)?.toDouble() ?? 0,
        igst: (m['igst'] as num?)?.toDouble() ?? 0,
        total: (m['total'] as num?)?.toDouble() ?? 0,
        templateId: (m['templateId'] as num?)?.toInt() ?? 1,
        notes: m['notes'] as String? ?? '',
        terms: m['terms'] as String? ?? '',
        dueDate: m['dueDate'] as String?,
        convertedToInvoiceId: m['convertedToInvoiceId'] as String?,
        createdAt: m['createdAt'] as String? ?? '',
        updatedAt: m['updatedAt'] as String? ?? '',
      );
}

enum PaymentMode { cash, upi, bank, cheque, other }

extension PaymentModeX on PaymentMode {
  String get label => name;
  static PaymentMode fromString(String s) =>
      PaymentMode.values.firstWhere((e) => e.name == s,
          orElse: () => PaymentMode.cash);
}

class Payment {
  final String id;
  final String userId;
  final String invoiceId;
  final String? customerId;
  final double amount;
  final PaymentMode mode;
  final String? upiRef;
  final String date;
  final String notes;
  final String createdAt;

  const Payment({
    required this.id,
    required this.userId,
    required this.invoiceId,
    this.customerId,
    required this.amount,
    required this.mode,
    this.upiRef,
    required this.date,
    required this.notes,
    required this.createdAt,
  });

  factory Payment.fromMap(String id, Map<String, dynamic> m) => Payment(
        id: id,
        userId: m['userId'] as String? ?? '',
        invoiceId: m['invoiceId'] as String? ?? '',
        customerId: m['customerId'] as String?,
        amount: (m['amount'] as num?)?.toDouble() ?? 0,
        mode: PaymentModeX.fromString(m['mode'] as String? ?? 'cash'),
        upiRef: m['upiRef'] as String?,
        date: m['date'] as String? ?? '',
        notes: m['notes'] as String? ?? '',
        createdAt: m['createdAt'] as String? ?? '',
      );
}

class Business {
  final String businessName;
  final String address;
  final String gstin;
  final String pan;
  final String? phone;
  final String? email;
  final String? website;
  final String? logoUrl;
  final double defaultGstRate;
  final String invoicePrefix;
  final String quotationPrefix;
  final String defaultTerms;
  final String defaultNotes;
  final String upiId;
  final int defaultTemplate;

  const Business({
    required this.businessName,
    required this.address,
    required this.gstin,
    required this.pan,
    this.phone,
    this.email,
    this.website,
    this.logoUrl,
    required this.defaultGstRate,
    required this.invoicePrefix,
    required this.quotationPrefix,
    required this.defaultTerms,
    required this.defaultNotes,
    required this.upiId,
    required this.defaultTemplate,
  });

  factory Business.fromMap(Map<String, dynamic> m) => Business(
        businessName: m['businessName'] as String? ?? '',
        address: m['address'] as String? ?? '',
        gstin: m['gstin'] as String? ?? '',
        pan: m['pan'] as String? ?? '',
        phone: m['phone'] as String?,
        email: m['email'] as String?,
        website: m['website'] as String?,
        logoUrl: m['logoUrl'] as String?,
        defaultGstRate: (m['defaultGstRate'] as num?)?.toDouble() ?? 18,
        invoicePrefix: m['invoicePrefix'] as String? ?? 'INV-',
        quotationPrefix: m['quotationPrefix'] as String? ?? 'QUO-',
        defaultTerms: m['defaultTerms'] as String? ?? '',
        defaultNotes: m['defaultNotes'] as String? ?? '',
        upiId: m['upiId'] as String? ?? '',
        defaultTemplate: (m['defaultTemplate'] as num?)?.toInt() ?? 1,
      );

  Map<String, dynamic> toMap() => {
        'businessName': businessName,
        'address': address,
        'gstin': gstin,
        'pan': pan,
        'phone': phone,
        'email': email,
        'website': website,
        'logoUrl': logoUrl,
        'defaultGstRate': defaultGstRate,
        'invoicePrefix': invoicePrefix,
        'quotationPrefix': quotationPrefix,
        'defaultTerms': defaultTerms,
        'defaultNotes': defaultNotes,
        'upiId': upiId,
        'defaultTemplate': defaultTemplate,
        'updatedAt': DateTime.now().toIso8601String(),
      };
}
