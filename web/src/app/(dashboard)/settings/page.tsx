"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteUser, updateProfile, signOut } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { Upload, Trash2, LogOut, ShieldAlert, Check } from "lucide-react";
import { useRouter } from "next/navigation";

type TabType = "profile" | "invoice" | "account";

export default function SettingsPage() {
  const { user } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // Tab 1: Profile State
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [upiId, setUpiId] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Tab 2: Invoice Settings State
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [quotationPrefix, setQuotationPrefix] = useState("QUO-");
  const [defaultGstRate, setDefaultGstRate] = useState(18);
  const [defaultTerms, setDefaultTerms] = useState("");
  const [defaultNotes, setDefaultNotes] = useState("");
  const [defaultTemplate, setDefaultTemplate] = useState<1 | 2 | 3>(1);

  // Tab 3: Account State
  const [displayName, setDisplayName] = useState("");
  
  // UI & loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (business) {
      setBusinessName(business.businessName ?? "");
      setAddress(business.address ?? "");
      setGstin(business.gstin ?? "");
      setPan(business.pan ?? "");
      setPhone((business as any).phone ?? "");
      setEmail((business as any).email ?? "");
      setUpiId(business.upiId ?? "");
      setWebsite((business as any).website ?? "");
      setLogoUrl(business.logoUrl ?? null);
      
      setInvoicePrefix(business.invoicePrefix ?? "INV-");
      setQuotationPrefix(business.quotationPrefix ?? "QUO-");
      setDefaultGstRate(business.defaultGstRate ?? 18);
      setDefaultTerms(business.defaultTerms ?? "");
      setDefaultNotes((business as any).defaultNotes ?? "");
      setDefaultTemplate((business as any).defaultTemplate ?? 1);
    }
    if (user) {
      setDisplayName(user.displayName ?? "");
    }
  }, [business, user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Logo file size must be less than 5MB");
    }
    if (!file.type.startsWith("image/")) {
      return toast.error("Logo must be an image file");
    }

    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `logos/${user.uid}/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      setLogoUrl(url);

      // Save logo URL to Firestore
      const businessRef = doc(db, "businesses", user.uid);
      await setDoc(businessRef, { logoUrl: url }, { merge: true });
      toast.success("Logo uploaded successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = "Business name is required";
    if (gstin && gstin.length !== 15) newErrors.gstin = "GSTIN must be 15 characters";
    if (pan && pan.length !== 10) newErrors.pan = "PAN must be 10 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSavingProfile(true);
    try {
      const businessRef = doc(db, "businesses", user.uid);
      await setDoc(businessRef, {
        businessName: businessName.trim(),
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        phone: phone.trim(),
        email: email.trim(),
        upiId: upiId.trim(),
        website: website.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("Profile saved successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleInvoiceSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingInvoice(true);
    try {
      const businessRef = doc(db, "businesses", user.uid);
      await setDoc(businessRef, {
        invoicePrefix: invoicePrefix.trim(),
        quotationPrefix: quotationPrefix.trim(),
        defaultGstRate: Number(defaultGstRate),
        defaultTerms: defaultTerms.trim(),
        defaultNotes: defaultNotes.trim(),
        defaultTemplate: Number(defaultTemplate),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("Invoice settings saved successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save settings");
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSavingAccount(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      // Sync user profile in users collection
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: displayName.trim(),
      }, { merge: true });
      toast.success("Account profile updated");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update profile");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setDeletingAccount(true);
    try {
      // Delete user databases
      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteDoc(doc(db, "businesses", currentUser.uid));
      // Delete auth user
      await deleteUser(currentUser);
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        toast.error("Please log out and sign in again to perform this sensitive action.");
      } else {
        toast.error(err.message ?? "Failed to delete account");
      }
    } finally {
      setDeletingAccount(false);
      setDeleteModalOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (businessLoading) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading settings…</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Tabs list */}
      <div className="flex border-b border-green-brand-100 gap-6">
        {(["profile", "invoice", "account"] as TabType[]).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`pb-3.5 text-sm font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? "border-green-brand-600 text-green-brand-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "profile" ? "Business Profile" : tab === "invoice" ? "Invoice Settings" : "Account"}
          </button>
        ))}
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="card p-8 space-y-6">
          <h3 className="font-poppins font-bold text-lg text-slate-900">Business Profile</h3>
          
          {/* Logo Upload Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-green-brand-200 bg-green-brand-50/20 flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Upload className="text-green-brand-400" size={24} />
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="logo-file" className="btn-secondary text-xs cursor-pointer py-1.5 px-3">
                <Upload size={14} /> Upload Logo
                <input
                  id="logo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-400 mt-2">JPEG, PNG up to 5MB. Publicly visible in PDFs.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              id="settings-name"
              label="Business Name *"
              placeholder="Acme Enterprises"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={errors.businessName}
            />
            <Input
              id="settings-phone"
              label="Phone"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              id="settings-email"
              label="Business Email"
              type="email"
              placeholder="info@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="settings-web"
              label="Website"
              placeholder="https://acme.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="settings-address" className="label">Address *</label>
            <textarea
              id="settings-address"
              className="input min-h-[90px] resize-none"
              placeholder="Full physical address of the business"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              id="settings-gst"
              label="GSTIN"
              placeholder="15-char GSTIN"
              className="font-mono uppercase"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              error={errors.gstin}
              maxLength={15}
            />
            <Input
              id="settings-pan"
              label="PAN"
              placeholder="10-char PAN"
              className="font-mono uppercase"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              error={errors.pan}
              maxLength={10}
            />
            <Input
              id="settings-upi"
              label="UPI ID (for payments)"
              placeholder="e.g. business@okaxis"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button id="profile-save-btn" variant="primary" type="submit" loading={savingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Invoice Settings */}
      {activeTab === "invoice" && (
        <form onSubmit={handleInvoiceSettingsSave} className="card p-8 space-y-6">
          <h3 className="font-poppins font-bold text-lg text-slate-900">Invoice Settings</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              id="settings-invprefix"
              label="Invoice Number Prefix"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
            />
            <Input
              id="settings-quoprefix"
              label="Quotation Number Prefix"
              value={quotationPrefix}
              onChange={(e) => setQuotationPrefix(e.target.value)}
            />
            <div>
              <label htmlFor="settings-gstpct" className="label">Default GST Rate</label>
              <select
                id="settings-gstpct"
                className="input"
                value={defaultGstRate}
                onChange={(e) => setDefaultGstRate(Number(e.target.value))}
              >
                {[0, 5, 12, 18, 28].map((g) => (
                  <option key={g} value={g}>{g}%</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="settings-terms" className="label">Default Payment Terms & Conditions</label>
            <textarea
              id="settings-terms"
              className="input min-h-[90px] resize-none"
              placeholder="Terms visible at the bottom of invoices"
              value={defaultTerms}
              onChange={(e) => setDefaultTerms(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="settings-notes" className="label">Default Notes</label>
            <textarea
              id="settings-notes"
              className="input min-h-[90px] resize-none"
              placeholder="Thank you for your business / details"
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="settings-template" className="label">Default PDF Template</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 1, name: "Classic", desc: "Traditional" },
                { id: 2, name: "Modern", desc: "Bold header" },
                { id: 3, name: "Minimal", desc: "Clean & simple" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  id={`settings-template-${tmpl.id}`}
                  onClick={() => setDefaultTemplate(tmpl.id as any)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    defaultTemplate === tmpl.id
                      ? "border-green-brand-500 bg-green-brand-50/40 text-green-brand-700"
                      : "border-slate-200 hover:border-green-brand-300"
                  }`}
                >
                  <div className="font-semibold text-sm">{tmpl.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{tmpl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button id="invoice-save-btn" variant="primary" type="submit" loading={savingInvoice}>
              Save Settings
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Account */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <form onSubmit={handleAccountSave} className="card p-8 space-y-6">
            <h3 className="font-poppins font-bold text-lg text-slate-900">Account Profile</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                id="settings-displayname"
                label="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <div>
                <label className="label">Registered Email</label>
                <div className="input bg-slate-50 text-slate-500 select-all font-mono text-sm py-2.5">
                  {user?.email}
                </div>
              </div>
            </div>

            <div>
              <label className="label">Subscription Plan</label>
              <div className="flex items-center gap-3">
                <span className="badge-green font-bold text-xs uppercase px-3 py-1">Free Plan</span>
                <span className="text-xs text-slate-400">Upgrade to Pro coming soon in v2.</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                id="settings-signout"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <Button id="account-save-btn" variant="primary" type="submit" loading={savingAccount}>
                Update Name
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="card border border-red-100 p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-slate-900">Danger Zone</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Permanently delete your account and all associated invoices, customers, and business data.
                  This action is irreversible and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-red-50">
              <button
                type="button"
                id="settings-delete-account"
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        size="md"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-poppins font-bold text-slate-950 text-base">
            Are you absolutely sure?
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            All your invoices, customers, settings, and business profile data will be permanently wiped.
          </p>
          <div className="flex justify-center gap-3 pt-6 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <button
              id="confirm-delete-btn"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {deletingAccount ? "Deleting…" : "Yes, Delete Everything"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
