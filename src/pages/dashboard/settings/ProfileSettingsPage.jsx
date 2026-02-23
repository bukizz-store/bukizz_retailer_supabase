import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { warehouseService } from "@/services/warehouseService";
import { bankService } from "@/services/bankService";
import apiClient from "@/lib/apiClient";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { SignatureModal } from "@/components/onboarding/SignatureModal";
import {
  User,
  Mail,
  Phone,
  Store,
  MapPin,
  Globe,
  FileText,
  ShieldCheck,
  Building2,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  X,
  ChevronRight,
  Warehouse,
  Landmark,
  Plus,
  Pencil,
  Trash2,
  Star,
  PenTool,
  Type,
  IndianRupee,
  BadgeCheck,
} from "lucide-react";

const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const textToImageFile = (text, filename) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 48;
  ctx.font = `${fontSize}px cursive`;
  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + 40;
  canvas.height = 100;

  ctx.font = `${fontSize}px cursive`;
  ctx.fillStyle = "black";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, 50);

  const dataurl = canvas.toDataURL("image/png");
  return dataURLtoFile(dataurl, filename);
};

/* ═══════════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const InfoRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
  copyable = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(typeof value === "string" ? value : "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-medium text-slate-800 break-all ${
            mono ? "font-mono tracking-wide" : ""
          }`}
        >
          {value || <span className="italic text-slate-400">Not provided</span>}
        </p>
      </div>
      {copyable && value && typeof value === "string" && (
        <button
          onClick={handleCopy}
          title="Copy"
          className="mt-1 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {copied ? (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, badge, action, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        {action}
      </div>
    </div>
    <div className="px-6 py-2 divide-y divide-slate-100">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   WAREHOUSE DETAIL MODAL  (unchanged)
   ═══════════════════════════════════════════════════════════════════ */

const WarehouseDetailModal = ({ warehouse, onClose }) => {
  if (!warehouse) return null;

  const addr = warehouse.address || {};
  const fullAddress = [addr.line1, addr.line2].filter(Boolean).join(", ");
  const pincode = addr.postal_code || addr.postalCode || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {warehouse.name}
              </h3>
              <p className="text-xs text-slate-400">Warehouse Details</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-slate-100">
            <InfoRow icon={Store} label="Store Name" value={warehouse.name} />
            <InfoRow
              icon={Mail}
              label="Contact Email"
              value={warehouse.contact_email}
              copyable
            />
            <InfoRow
              icon={Phone}
              label="Contact Phone"
              value={warehouse.contact_phone}
              copyable
            />
            <InfoRow icon={Globe} label="Website" value={warehouse.website} />
          </div>
          {(fullAddress || addr.city || pincode) && (
            <>
              <div className="mt-4 mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Pickup Address
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {fullAddress && (
                  <InfoRow
                    icon={MapPin}
                    label="Street Address"
                    value={fullAddress}
                  />
                )}
                {addr.city && (
                  <InfoRow icon={Building2} label="City" value={addr.city} />
                )}
                {addr.state && (
                  <InfoRow icon={MapPin} label="State" value={addr.state} />
                )}
                {pincode && (
                  <InfoRow
                    icon={FileText}
                    label="Pincode"
                    value={pincode}
                    mono
                  />
                )}
                <InfoRow
                  icon={Globe}
                  label="Country"
                  value={addr.country || "India"}
                />
              </div>
            </>
          )}
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   BANK DETAILS – ADD / EDIT MODAL
   ═══════════════════════════════════════════════════════════════════ */

const EMPTY_BANK = {
  accountHolderName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  accountType: "savings",
  isPrimary: false,
};

const BankFormModal = ({ isOpen, onClose, onSave, editData }) => {
  const [form, setForm] = useState(EMPTY_BANK);
  const [errors, setErrors] = useState({});
  // const [verifying, setVerifying] = useState(false);
  // const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({ ...editData, confirmAccountNumber: editData.accountNumber });
    } else {
      setForm(EMPTY_BANK);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.accountHolderName.trim())
      e.accountHolderName = "Account holder name is required";
    if (!form.accountNumber.trim())
      e.accountNumber = "Account number is required";
    else if (!/^\d{9,18}$/.test(form.accountNumber.trim()))
      e.accountNumber = "Enter a valid account number (9-18 digits)";
    if (form.accountNumber !== form.confirmAccountNumber)
      e.confirmAccountNumber = "Account numbers do not match";
    if (!form.ifscCode.trim()) e.ifscCode = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase()))
      e.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234)";
    if (!form.bankName.trim()) e.bankName = "Bank name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // setVerifyError("");
    if (!validate()) return;
    // setVerifying(true);
    // Only verify if adding (not editing)
    // if (!editData) {
    //     const { success, error } = await bankService.verifyBank({
    //         accountHolderName: form.accountHolderName,
    //         accountNumber: form.accountNumber,
    //         ifscCode: form.ifscCode.trim().toUpperCase(),
    //     });
    //     if (!success) {
    //         setVerifyError(error || "Bank verification failed. Please try again.");
    //         setVerifying(false);
    //         return;
    //     }
    // }
    // setVerifying(false);
    onSave({
      ...form,
      ifscCode: form.ifscCode.trim().toUpperCase(),
      id: editData?.id || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6">
          {/*
                    {verifyError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {verifyError}
                        </div>
                    )}
                    */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editData ? "Edit Bank Account" : "Add Bank Account"}
              </h3>
              <p className="text-xs text-slate-400">
                {editData
                  ? "Update your bank details"
                  : "Enter your bank account information"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Account Holder Name"
              placeholder="Enter name as per bank records"
              value={form.accountHolderName}
              onChange={(e) => update("accountHolderName", e.target.value)}
              error={errors.accountHolderName}
              required
            />

            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={form.accountNumber}
              onChange={(e) =>
                update("accountNumber", e.target.value.replace(/\D/g, ""))
              }
              error={errors.accountNumber}
              required
            />

            <Input
              label="Confirm Account Number"
              placeholder="Re-enter account number"
              value={form.confirmAccountNumber}
              onChange={(e) =>
                update(
                  "confirmAccountNumber",
                  e.target.value.replace(/\D/g, ""),
                )
              }
              error={errors.confirmAccountNumber}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="IFSC Code"
                placeholder="e.g. SBIN0001234"
                value={form.ifscCode}
                onChange={(e) =>
                  update("ifscCode", e.target.value.toUpperCase())
                }
                error={errors.ifscCode}
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account Type <span className="ml-0.5 text-red-500">*</span>
                </label>
                <select
                  value={form.accountType}
                  onChange={(e) => update("accountType", e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>
            </div>

            <Input
              label="Bank Name"
              placeholder="e.g. State Bank of India"
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              error={errors.bankName}
              required
            />

            <Input
              label="Branch Name"
              placeholder="e.g. Connaught Place, Delhi"
              value={form.branchName}
              onChange={(e) => update("branchName", e.target.value)}
            />

            {/* primary toggle */}
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => update("isPrimary", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Set as primary account
                </p>
                <p className="text-xs text-slate-400">
                  Payments will be credited to this account
                </p>
              </div>
            </label>
          </div>

          {/* actions */}
          <div className="mt-6 flex gap-3 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="success">
              {editData ? (
                <>
                  <Pencil className="h-4 w-4" /> Update Account
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirmation Modal ────────────────────────────────── */
const DeleteBankModal = ({ isOpen, bankName, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="px-6 pt-5 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Delete Bank Account
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Are you sure you want to remove{" "}
            <strong className="text-slate-700">{bankName}</strong> account? This
            action cannot be undone.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   BUSINESS DETAILS MODAL
   ═══════════════════════════════════════════════════════════════════ */
const BusinessDetailsModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    displayName: "",
    ownerName: "",
    gstin: "",
    pan: "",
  });
  const [errors, setErrors] = useState({});
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState("draw");

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        displayName: initialData.displayName || "",
        ownerName: initialData.ownerName || "",
        gstin: initialData.gstin || "",
        pan: initialData.pan || "",
      });
      setSignaturePreview(initialData.signatureUrl || null);
      setSignature(null);
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.displayName?.trim()) e.displayName = "Display name is required";
    if (!form.ownerName?.trim()) e.ownerName = "Owner name is required";
    if (!form.gstin?.trim()) e.gstin = "GSTIN is required";
    else if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstin.trim().toUpperCase(),
      )
    ) {
      e.gstin = "Invalid GSTIN format";
    }

    // PAN is optional, but if provided, validate it
    if (
      form.pan.trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.trim().toUpperCase())
    ) {
      e.pan = "Invalid PAN format";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      displayName: form.displayName.trim(),
      ownerName: form.ownerName.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      pan: form.pan.trim().toUpperCase(),
      signature: signature,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          onSubmit={handleSubmit}
          className="px-6 pt-5 pb-6 max-h-[90vh] overflow-y-auto w-full"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Update Business Details
              </h3>
              <p className="text-xs text-slate-500">
                Modify your registration and tax information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Display Name (Shop/Company)"
              placeholder="Enter display name"
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              error={errors.displayName}
              required
            />

            <Input
              label="Owner Name (Individual)"
              placeholder="Enter owner's full name"
              value={form.ownerName}
              onChange={(e) => update("ownerName", e.target.value)}
              error={errors.ownerName}
              required
            />

            <Input
              label="GSTIN"
              placeholder="e.g. 29ABCDE1234F2Z5"
              value={form.gstin}
              onChange={(e) => update("gstin", e.target.value.toUpperCase())}
              error={errors.gstin}
              required
            />

            <Input
              label="PAN Number"
              placeholder="e.g. ABCDE1234F (Optional)"
              value={form.pan}
              onChange={(e) => update("pan", e.target.value.toUpperCase())}
              error={errors.pan}
            />

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-700 mb-3">
                Update E-Signature
              </h3>

              {signature ? (
                <div className="relative flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 group">
                  <div className="flex-1 flex justify-center items-center bg-white border border-slate-200 rounded p-4 overflow-hidden h-24">
                    {signature.type === "drawn" ? (
                      <img
                        src={signature.data}
                        alt="Signature"
                        className="object-contain h-full"
                      />
                    ) : (
                      <p
                        className="text-xl sm:text-3xl text-slate-800"
                        style={{ fontFamily: "cursive" }}
                      >
                        {signature.data}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureTab("draw");
                        setShowSignatureModal(true);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignature(null)}
                      className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : signaturePreview ? (
                <div className="relative flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1 flex justify-center items-center bg-white border border-slate-200 rounded p-4 overflow-hidden h-24">
                    <img
                      src={signaturePreview}
                      alt="Current Signature"
                      className="object-contain h-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureTab("draw");
                        setShowSignatureModal(true);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Update
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[80px]">
                      Current E-Signature
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTab("draw");
                      setShowSignatureModal(true);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <PenTool className="w-5 h-5 opacity-70" />
                    <span className="text-xs font-medium">Draw Signature</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureTab("create");
                      setShowSignatureModal(true);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Type className="w-5 h-5 opacity-70" />
                    <span className="text-xs font-medium">Type Signature</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="success">
              <Pencil className="h-4 w-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </form>

        <SignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSave={(data) => setSignature(data)}
          defaultTab={signatureTab}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION TABS CONFIG
   ═══════════════════════════════════════════════════════════════════ */

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "bank", label: "Bank Details", icon: Landmark },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  /* ── tab state ───────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState("profile");

  /* ── profile state ───────────────────────────────────────────── */
  const [retailerData, setRetailerData] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [whLoading, setWhLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  /* ── bank details state (server-synced) ────────────────────── */
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [deletingBank, setDeletingBank] = useState(null);

  /* ── business details modal state ────────────────────────────── */
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizSaving, setBizSaving] = useState(false);

  /* ── fetch bank accounts from server ──────────────────────── */
  const fetchBankAccounts = async () => {
    setBankLoading(true);
    try {
      const data = await bankService.getAll();
      setBankAccounts(data || []);
    } catch (err) {
      console.error("Bank accounts fetch error:", err);
      setBankAccounts([]);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // Define fetchProfile outside useEffect so it can be called on business details update
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, dataRes] = await Promise.allSettled([
        apiClient.get("/users/profile"),
        apiClient.get("/retailer/data/status"),
      ]);
      console.log(profileRes);
      const profile =
        profileRes.status === "fulfilled"
          ? profileRes.value?.data?.data || profileRes.value?.data
          : null;
      console.log("profile", profile);
      const retailer = profile?.user?.retailer_data;
      console.log("retailer", retailer);
      setRetailerData({ profile, retailer });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Unable to load profile details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /* ── fetch profile ────────────────────────────────────────────── */
  useEffect(() => {
    fetchProfile();
  }, []);

  /* ── fetch warehouses ─────────────────────────────────────────── */
  useEffect(() => {
    const fetchWarehouses = async () => {
      setWhLoading(true);
      try {
        const data = await warehouseService.getWarehouses();
        setWarehouses(data || []);
      } catch (err) {
        console.error("Warehouse fetch error:", err);
        setWarehouses([]);
      } finally {
        setWhLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  /* ── bank CRUD handlers (server-synced) ─────────────────────── */
  const handleSaveBank = async (bankData) => {
    setBankSaving(true);
    try {
      const payload = {
        accountHolderName: bankData.accountHolderName,
        accountNumber: bankData.accountNumber,
        ifscCode: bankData.ifscCode,
        bankName: bankData.bankName,
        branchName: bankData.branchName || "",
        accountType: bankData.accountType,
        isPrimary: bankData.isPrimary,
      };

      if (bankData.id) {
        await bankService.update(bankData.id, payload);
      } else {
        await bankService.add(payload);
      }

      // if marked as primary, call set-primary endpoint
      // (the add/update already handles it, but explicit call ensures consistency)
      await fetchBankAccounts();
      setBankModalOpen(false);
      setEditingBank(null);
      toast({ title: "Bank account saved successfully", variant: "success" });
    } catch (err) {
      console.error("Bank save error:", err);
      toast({
        title: "Failed to save bank account",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setBankSaving(false);
    }
  };

  const handleDeleteBank = async () => {
    if (!deletingBank) return;
    setBankSaving(true);
    try {
      await bankService.remove(deletingBank.id);
      await fetchBankAccounts();
      setDeletingBank(null);
      toast({ title: "Bank account deleted successfully", variant: "success" });
    } catch (err) {
      console.error("Bank delete error:", err);
      toast({
        title: "Failed to delete bank account",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setBankSaving(false);
    }
  };

  const handleSetPrimary = async (id) => {
    setBankSaving(true);
    try {
      await bankService.setPrimary(id);
      await fetchBankAccounts();
      toast({ title: "Primary account updated", variant: "success" });
    } catch (err) {
      console.error("Set primary error:", err);
      toast({
        title: "Failed to set primary account",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setBankSaving(false);
    }
  };

  /* ── business details handler ─────────────────────────────────── */
  const handleSaveBusinessDetails = async (bizData) => {
    setBizSaving(true);
    try {
      const formData = new FormData();
      formData.append("displayName", bizData.displayName);
      formData.append("ownerName", bizData.ownerName);
      formData.append("gstin", bizData.gstin);
      formData.append("pan", bizData.pan);

      if (bizData.signature) {
        let signatureFile;
        // Handle Signature
        if (bizData.signature.type === "drawn") {
          signatureFile = dataURLtoFile(
            bizData.signature.data,
            "signature.png",
          );
        } else if (bizData.signature.type === "typed") {
          signatureFile = textToImageFile(
            bizData.signature.data,
            "signature.png",
          );
        }
        formData.append("signature", signatureFile);
      }

      await apiClient.put("/retailer/data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchProfile(); // re-fetch to get updated details
      setBizModalOpen(false);
      toast({
        title: "Business details updated successfully",
        variant: "success",
      });
    } catch (err) {
      console.error("Update business details error:", err);
      toast({
        title: "Failed to update business details",
        description: err?.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setBizSaving(false);
    }
  };

  /* ── derived fields ───────────────────────────────────────────── */
  const profile = retailerData?.profile || {};
  const retailer = retailerData?.retailer || {};

  const displayName =
    retailer?.displayName ||
    user?.full_name ||
    user?.fullName ||
    profile?.full_name ||
    "Retailer";
  const email = user?.email || profile?.email || "";
  const phone = user?.phone || profile?.phone || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ownerName = retailer?.ownerName || "";
  const gstin = retailer?.gstin || profile?.gstin || "";
  const pan =
    retailer?.pan ||
    retailer?.panNumber ||
    retailer?.pan_number ||
    profile?.pan ||
    "";
  const businessCategory =
    retailer?.businessCategory ||
    retailer?.business_category ||
    profile?.business_category ||
    "";
  const signatureUrl =
    retailer?.signatureUrl ||
    retailer?.signature_url ||
    profile?.signature_url ||
    "";

  const verificationStatus =
    retailer?.status || profile?.verification_status || user?.status || "";
  const isVerified =
    verificationStatus === "authorized" || verificationStatus === "verified";

  const formatCategory = (cat) => {
    if (!cat) return "";
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const maskAccount = (num) => {
    if (!num || num.length < 4) return num;
    return "●●●● ●●●● " + num.slice(-4);
  };

  /* ── loading / error states ───────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm text-slate-600">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════
       RENDER
       ═════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Modals ─────────────────────────────────────────────── */}
      {selectedWarehouse && (
        <WarehouseDetailModal
          warehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}
      <BankFormModal
        isOpen={bankModalOpen}
        onClose={() => {
          setBankModalOpen(false);
          setEditingBank(null);
        }}
        onSave={handleSaveBank}
        editData={editingBank}
      />
      <DeleteBankModal
        isOpen={!!deletingBank}
        bankName={deletingBank?.bankName}
        onClose={() => setDeletingBank(null)}
        onConfirm={handleDeleteBank}
      />
      <BusinessDetailsModal
        isOpen={bizModalOpen}
        onClose={() => setBizModalOpen(false)}
        onSave={handleSaveBusinessDetails}
        initialData={retailer}
      />

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile, business details and bank information.
          </p>
        </div>
      </div>

      {/* ── Section Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                                flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                }
                            `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.key === "bank" && bankAccounts.length > 0 && (
                <span
                  className={`ml-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {bankAccounts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
               PROFILE TAB
               ═══════════════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
            <div className="relative px-6 pb-6">
              <div className="absolute -top-10 left-6 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              </div>
              <div className="pt-14 sm:flex sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {displayName}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">{email}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-0">
                  <Badge variant={isVerified ? "approved" : "pending"} dot>
                    {isVerified ? "Verified" : "Pending Verification"}
                  </Badge>
                  {businessCategory && (
                    <Badge variant="info" dot>
                      {formatCategory(businessCategory)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard icon={User} title="Account Information">
              <InfoRow icon={User} label="Full Name" value={displayName} />
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={email}
                copyable
              />
              <InfoRow
                icon={Phone}
                label="Mobile Number"
                value={phone}
                copyable
              />
              <InfoRow
                icon={ShieldCheck}
                label="Account Status"
                value={
                  isVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Authorized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" /> Pending Approval
                    </span>
                  )
                }
              />
            </SectionCard>

            <SectionCard
              icon={Building2}
              title="Business Details"
              badge={
                businessCategory ? (
                  <Badge variant="info">
                    {formatCategory(businessCategory)}
                  </Badge>
                ) : null
              }
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBizModalOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit
                </Button>
              }
            >
              <InfoRow
                icon={Store}
                label="Display Name (Shop/Company)"
                value={displayName}
              />
              <InfoRow
                icon={User}
                label="Owner Name (Individual)"
                value={ownerName}
              />
              <InfoRow
                icon={FileText}
                label="GSTIN"
                value={gstin}
                mono
                copyable
              />
              <InfoRow
                icon={CreditCard}
                label="PAN Number"
                value={pan}
                mono
                copyable
              />
              {signatureUrl && (
                <div className="py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                    E-Signature
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
                    <img
                      src={signatureUrl}
                      alt="E-Signature"
                      className="max-h-16 object-contain"
                    />
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Warehouses */}
          <SectionCard
            icon={Warehouse}
            title={`My Warehouses${!whLoading && warehouses.length ? ` (${warehouses.length})` : ""}`}
            badge={
              !whLoading && warehouses.length > 0 ? (
                <Badge variant="approved" dot>
                  {warehouses.length} Active
                </Badge>
              ) : null
            }
          >
            {whLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading warehouses…
              </div>
            ) : warehouses.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Warehouse className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  No warehouses yet
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Warehouses you set up will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
                {warehouses.map((wh) => {
                  const addr = wh.address || {};
                  const shortAddr = [addr.city, addr.state]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => setSelectedWarehouse(wh)}
                      className="group relative text-left rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <Store className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {wh.name}
                          </p>
                          {shortAddr && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {shortAddr}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors mt-1" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {wh.contact_email && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                            <Mail className="h-3 w-3" />
                            {wh.contact_email}
                          </span>
                        )}
                        {wh.contact_phone && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                            <Phone className="h-3 w-3" />
                            {wh.contact_phone}
                          </span>
                        )}
                      </div>
                      <p className="mt-2.5 text-[11px] text-slate-400 group-hover:text-blue-500 transition-colors">
                        Click to view details →
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
               BANK DETAILS TAB
               ═══════════════════════════════════════════════════════════ */}
      {activeTab === "bank" && (
        <div className="space-y-6">
          {/* ── Bank Section Header ─────────────────────────── */}
          <SectionCard
            icon={Landmark}
            title="Bank Accounts"
            badge={
              bankAccounts.length > 0 ? (
                <Badge variant="approved" dot>
                  {bankAccounts.length} Saved
                </Badge>
              ) : null
            }
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditingBank(null);
                  setBankModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Account
              </Button>
            }
          >
            {bankLoading ? (
              /* ── loading state ────────────────────────────── */
              <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading bank
                accounts…
              </div>
            ) : bankAccounts.length === 0 ? (
              /* ── empty state ─────────────────────────────── */
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <Landmark className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  No bank accounts added
                </h3>
                <p className="mt-1 text-sm text-slate-400 max-w-xs mx-auto">
                  Add your bank account details to receive payments for your
                  orders.
                </p>
                <Button
                  size="sm"
                  className="mt-5"
                  onClick={() => {
                    setEditingBank(null);
                    setBankModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add Bank Account
                </Button>
              </div>
            ) : (
              /* ── account cards ───────────────────────────── */
              <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                {bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    className={`group relative rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
                      bank.isPrimary
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* primary badge */}
                    {bank.isPrimary && (
                      <div className="absolute -top-2.5 left-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                          <Star className="h-3 w-3" /> Primary
                        </span>
                      </div>
                    )}

                    {/* header */}
                    <div className="flex items-start justify-between mt-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            bank.isPrimary
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Landmark className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {bank.bankName}
                          </p>
                          {bank.branchName && (
                            <p className="text-xs text-slate-400">
                              {bank.branchName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* details */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Account No.
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-700">
                          {maskAccount(bank.accountNumber)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">IFSC</span>
                        <span className="text-xs font-mono font-medium text-slate-700">
                          {bank.ifscCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Holder</span>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                          {bank.accountHolderName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Type</span>
                        <Badge variant="default">
                          {bank.accountType === "current"
                            ? "Current"
                            : "Savings"}
                        </Badge>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      {!bank.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(bank.id)}
                          disabled={bankSaving}
                          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bankSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Star className="h-3 w-3" />
                          )}{" "}
                          Set Primary
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => {
                          setEditingBank(bank);
                          setBankModalOpen(true);
                        }}
                        disabled={bankSaving}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBank(bank)}
                        disabled={bankSaving}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Info note ────────────────────────────────────── */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Securely Synced
              </p>
              <p className="mt-0.5 text-xs text-emerald-700 leading-relaxed">
                Your bank details are securely saved on our server. They will be
                used for processing payouts once verification is complete.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
