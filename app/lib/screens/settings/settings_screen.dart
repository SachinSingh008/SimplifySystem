import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../core/theme.dart';
import '../../providers/providers.dart';
import '../../widgets/common_widgets.dart';
import '../../services/firestore_service.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  int _tab = 0; // 0=Profile 1=Invoice 2=Account

  // Profile tab
  final _bizName  = TextEditingController();
  final _address  = TextEditingController();
  final _gstin    = TextEditingController();
  final _pan      = TextEditingController();
  final _phone    = TextEditingController();
  final _email    = TextEditingController();
  final _upiId    = TextEditingController();
  final _website  = TextEditingController();
  String? _logoUrl;
  bool _savingProfile = false;
  bool _uploadingLogo = false;

  // Invoice tab
  final _invPrefix = TextEditingController();
  final _quoPrefix = TextEditingController();
  final _terms     = TextEditingController();
  final _notes     = TextEditingController();
  double _gstRate  = 18;
  int    _template = 1;
  bool _savingInvoice = false;

  // Account tab
  final _displayName = TextEditingController();
  bool _savingAccount = false;

  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  void _init() {
    final biz  = ref.read(businessProvider).value;
    final user = FirebaseAuth.instance.currentUser;
    if (biz != null) {
      _bizName.text  = biz.businessName;
      _address.text  = biz.address;
      _gstin.text    = biz.gstin;
      _pan.text      = biz.pan;
      _phone.text    = biz.phone ?? '';
      _email.text    = biz.email ?? '';
      _upiId.text    = biz.upiId;
      _website.text  = biz.website ?? '';
      _logoUrl       = biz.logoUrl;
      _invPrefix.text = biz.invoicePrefix;
      _quoPrefix.text = biz.quotationPrefix;
      _terms.text    = biz.defaultTerms;
      _notes.text    = biz.defaultNotes;
      _gstRate       = biz.defaultGstRate;
      _template      = biz.defaultTemplate;
    }
    if (user != null) _displayName.text = user.displayName ?? '';
    if (mounted) setState(() => _initialized = true);
  }

  @override
  void dispose() {
    for (final c in [_bizName,_address,_gstin,_pan,_phone,_email,_upiId,_website,_invPrefix,_quoPrefix,_terms,_notes,_displayName]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (xfile == null) return;
    final user = FirebaseAuth.instance.currentUser!;
    setState(() => _uploadingLogo = true);
    try {
      final ref = FirebaseStorage.instance
          .ref('logos/${user.uid}/${DateTime.now().millisecondsSinceEpoch}.jpg');
      await ref.putFile(File(xfile.path));
      final url = await ref.getDownloadURL();
      setState(() => _logoUrl = url);
      await FirestoreService().saveBusiness({'logoUrl': url});
      if (mounted) showSnack(context, 'Logo uploaded!');
    } catch (e) {
      if (mounted) showSnack(context, 'Upload failed: $e', error: true);
    } finally {
      if (mounted) setState(() => _uploadingLogo = false);
    }
  }

  Future<void> _saveProfile() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    setState(() => _savingProfile = true);
    try {
      await FirestoreService().saveBusiness({
        'businessName': _bizName.text.trim(),
        'address':      _address.text.trim(),
        'gstin':        _gstin.text.trim().toUpperCase(),
        'pan':          _pan.text.trim().toUpperCase(),
        'phone':        _phone.text.trim(),
        'email':        _email.text.trim(),
        'upiId':        _upiId.text.trim(),
        'website':      _website.text.trim(),
        'updatedAt':    DateTime.now().toIso8601String(),
      });
      if (mounted) showSnack(context, 'Profile saved!');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  Future<void> _saveInvoice() async {
    setState(() => _savingInvoice = true);
    try {
      await FirestoreService().saveBusiness({
        'invoicePrefix':  _invPrefix.text.trim(),
        'quotationPrefix':_quoPrefix.text.trim(),
        'defaultGstRate': _gstRate,
        'defaultTerms':   _terms.text.trim(),
        'defaultNotes':   _notes.text.trim(),
        'defaultTemplate':_template,
        'updatedAt':      DateTime.now().toIso8601String(),
      });
      if (mounted) showSnack(context, 'Invoice settings saved!');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingInvoice = false);
    }
  }

  Future<void> _saveAccount() async {
    setState(() => _savingAccount = true);
    try {
      await FirebaseAuth.instance.currentUser
          ?.updateDisplayName(_displayName.text.trim());
      if (mounted) showSnack(context, 'Name updated!');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingAccount = false);
    }
  }

  Future<void> _signOut() async {
    await FirebaseAuth.instance.signOut();
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Settings')),
      body: !_initialized
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Tab bar
                Container(
                  color: AppColors.white,
                  child: Row(
                    children: [
                      _Tab(label: 'Business', selected: _tab == 0, onTap: () => setState(() => _tab = 0)),
                      _Tab(label: 'Invoice',  selected: _tab == 1, onTap: () => setState(() => _tab = 1)),
                      _Tab(label: 'Account',  selected: _tab == 2, onTap: () => setState(() => _tab = 2)),
                    ],
                  ),
                ),
                const Divider(height: 1),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    child: _tab == 0
                        ? _buildProfile()
                        : _tab == 1
                            ? _buildInvoice()
                            : _buildAccount(user),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildProfile() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Logo
        Center(
          child: Column(
            children: [
              GestureDetector(
                onTap: _pickLogo,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.green50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: AppColors.green200, style: BorderStyle.solid, width: 2),
                  ),
                  child: _uploadingLogo
                      ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                      : _logoUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.network(_logoUrl!, fit: BoxFit.cover),
                            )
                          : const Icon(Icons.upload_rounded, color: AppColors.green600, size: 32),
                ),
              ),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: _pickLogo,
                icon: const Icon(Icons.upload_rounded, size: 16),
                label: const Text('Upload Logo'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _field(_bizName, 'Business Name *'),
        const SizedBox(height: 10),
        _field(_phone, 'Phone', type: TextInputType.phone),
        const SizedBox(height: 10),
        _field(_email, 'Business Email', type: TextInputType.emailAddress),
        const SizedBox(height: 10),
        _field(_website, 'Website'),
        const SizedBox(height: 10),
        TextFormField(
          controller: _address,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Address'),
        ),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: _field(_gstin, 'GSTIN', maxLength: 15, mono: true, caps: true)),
          const SizedBox(width: 10),
          Expanded(child: _field(_pan, 'PAN', maxLength: 10, mono: true, caps: true)),
        ]),
        const SizedBox(height: 10),
        _field(_upiId, 'UPI ID'),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _savingProfile ? null : _saveProfile,
            child: _savingProfile
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save Profile'),
          ),
        ),
      ],
    );
  }

  Widget _buildInvoice() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Expanded(child: _field(_invPrefix, 'Invoice Prefix')),
          const SizedBox(width: 10),
          Expanded(child: _field(_quoPrefix, 'Quotation Prefix')),
        ]),
        const SizedBox(height: 10),
        DropdownButtonFormField<double>(
          value: _gstRate,
          decoration: const InputDecoration(labelText: 'Default GST Rate'),
          items: [0,5,12,18,28].map((g) => DropdownMenuItem(value: g.toDouble(), child: Text('$g%'))).toList(),
          onChanged: (v) => setState(() => _gstRate = v ?? 18),
        ),
        const SizedBox(height: 10),
        TextFormField(controller: _terms, maxLines: 3, decoration: const InputDecoration(labelText: 'Default Terms & Conditions')),
        const SizedBox(height: 10),
        TextFormField(controller: _notes, maxLines: 3, decoration: const InputDecoration(labelText: 'Default Notes')),
        const SizedBox(height: 14),
        const Text('Default PDF Template', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.slate700)),
        const SizedBox(height: 8),
        Row(
          children: [
            _TemplateChip(id: 1, label: 'Classic',  selected: _template == 1, onTap: () => setState(() => _template = 1)),
            const SizedBox(width: 8),
            _TemplateChip(id: 2, label: 'Modern',   selected: _template == 2, onTap: () => setState(() => _template = 2)),
            const SizedBox(width: 8),
            _TemplateChip(id: 3, label: 'Minimal',  selected: _template == 3, onTap: () => setState(() => _template = 3)),
          ],
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _savingInvoice ? null : _saveInvoice,
            child: _savingInvoice
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save Settings'),
          ),
        ),
      ],
    );
  }

  Widget _buildAccount(User? user) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Profile avatar
        Center(
          child: Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.green100,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Center(
              child: Text(
                (user?.displayName?[0] ?? user?.email?[0] ?? 'U').toUpperCase(),
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.green700),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        _field(_displayName, 'Full Name'),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.slate50,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.slate200),
          ),
          child: Text(
            user?.email ?? '—',
            style: const TextStyle(fontSize: 13, color: AppColors.slate500, fontFamily: 'monospace'),
          ),
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.green100,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Text('Free Plan', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.green700)),
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _savingAccount ? null : _saveAccount,
            child: _savingAccount
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Update Name'),
          ),
        ),
        const SizedBox(height: 20),
        const Divider(),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: _signOut,
            icon: const Icon(Icons.logout_rounded, size: 18, color: Color(0xFFDC2626)),
            label: const Text('Sign Out', style: TextStyle(color: Color(0xFFDC2626))),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFDC2626)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String label, {
    TextInputType type = TextInputType.text,
    int? maxLength,
    bool mono = false,
    bool caps = false,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: type,
      maxLength: maxLength,
      textCapitalization: caps ? TextCapitalization.characters : TextCapitalization.none,
      style: mono ? const TextStyle(fontFamily: 'monospace', fontSize: 13) : null,
      decoration: InputDecoration(labelText: label, counterText: ''),
    );
  }
}

class _Tab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _Tab({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: selected ? AppColors.green600 : Colors.transparent,
                width: 2.5,
              ),
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: selected ? AppColors.green700 : AppColors.slate500,
            ),
          ),
        ),
      ),
    );
  }
}

class _TemplateChip extends StatelessWidget {
  final int id; final String label; final bool selected; final VoidCallback onTap;
  const _TemplateChip({required this.id, required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.green600 : AppColors.slate50,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? AppColors.green600 : AppColors.slate200),
        ),
        child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: selected ? Colors.white : AppColors.slate600)),
      ),
    );
  }
}
