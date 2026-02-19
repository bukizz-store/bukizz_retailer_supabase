import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { BusinessCategoryToggle } from "@/components/onboarding/BusinessCategoryToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import apiClient from "@/lib/apiClient";
import useAuthStore from "@/store/authStore";
import useWarehouseStore from "@/store/warehouseStore";
import {
  registrationStartSchema,
  businessDetailsSchema,
  warehouseDetailsSchema,
} from "@/lib/validations";
import { SignatureModal } from "@/components/onboarding/SignatureModal";
import {
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  ChevronDown,
  User,
  Lock,
  X,
  PenTool,
  Type,
  Store,
  MapPin,
  Globe,
  AlertCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { EmailOtpModal } from "@/components/onboarding/EmailOtpModal";

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

  // Transparent background is default.
  ctx.font = `${fontSize}px cursive`;
  ctx.fillStyle = "black";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 20, 50);

  const dataurl = canvas.toDataURL("image/png");
  return dataURLtoFile(dataurl, filename);
};

export default function RegisterPage() {
  const location = useLocation();
  const resumeOnboarding = location.state?.resumeOnboarding || false;
  const resumeStep = location.state?.resumeStep || null; // 'business' if warehouse is missing

  // Steps: 'mobile' -> 'email' (ID & Signature) -> 'business' (Store & Pickup — final step)
  // If resuming onboarding:
  //   - resumeStep='business' → profile done, skip to Store & Pickup
  //   - otherwise → start at ID & Signature step
  const getInitialStep = () => {
    if (!resumeOnboarding) return "mobile";
    if (resumeStep === "business") return "business";
    return "email";
  };

  const getInitialCompleted = () => {
    if (!resumeOnboarding) return [];
    if (resumeStep === "business") return ["mobile", "email"];
    return ["mobile"];
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [completedSteps, setCompletedSteps] = useState(getInitialCompleted);

  // Email Verification State
  const [emailVerified, setEmailVerified] = useState(
    resumeOnboarding ? true : false,
  );
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState("");

  // ID & Signature State
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState("draw");

  const [businessCategory, setBusinessCategory] = useState("all_categories");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  const { sendOtp, verifyOtp, completeOnboarding, logout } = useAuthStore();
  const navigate = useNavigate();

  const registerForm = useForm({
    resolver: zodResolver(registrationStartSchema),
    mode: "onChange",
  });

  const businessForm = useForm({
    resolver: zodResolver(businessDetailsSchema),
    mode: "onChange",
    defaultValues: {
      businessCategory: "all_categories",
      address: {},
    },
  });

  // ── Warehouse Store (persisted state for Store & Pickup Details) ────
  const {
    name: whName,
    contactEmail: whContactEmail,
    contactPhone: whContactPhone,
    website: whWebsite,
    address: whAddress,
    isSubmitting: whIsSubmitting,
    error: whError,
    isCreated: whIsCreated,
    updateField: whUpdateField,
    updateAddress: whUpdateAddress,
    createWarehouse,
    clearError: whClearError,
  } = useWarehouseStore();

  const warehouseForm = useForm({
    resolver: zodResolver(warehouseDetailsSchema),
    mode: "onChange",
    defaultValues: {
      name: whName || "",
      contactEmail: whContactEmail || "",
      contactPhone: whContactPhone || "",
      website: whWebsite || "",
      address: {
        line1: whAddress?.line1 || "",
        line2: whAddress?.line2 || "",
        city: whAddress?.city || "",
        state: whAddress?.state || "",
        postalCode: whAddress?.postalCode || "",
        country: whAddress?.country || "India",
        lat: whAddress?.lat || null,
        lng: whAddress?.lng || null,
      },
    },
  });

  // Sync react-hook-form → Zustand store on every field change
  useEffect(() => {
    const subscription = warehouseForm.watch((values) => {
      if (values.name !== undefined) whUpdateField("name", values.name);
      if (values.contactEmail !== undefined)
        whUpdateField("contactEmail", values.contactEmail);
      if (values.contactPhone !== undefined)
        whUpdateField("contactPhone", values.contactPhone);
      if (values.website !== undefined)
        whUpdateField("website", values.website);
      if (values.address) {
        Object.entries(values.address).forEach(([key, val]) => {
          if (val !== undefined) whUpdateAddress(key, val);
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [warehouseForm, whUpdateField, whUpdateAddress]);

  const handleSendOtp = async () => {
    const isValid = await registerForm.trigger();
    if (!isValid) return;

    setIsLoading(true);
    setOtpError("");
    try {
      const data = registerForm.getValues();
      const result = await sendOtp(
        data.fullName,
        data.email,
        data.password,
        data.mobile,
      );

      if (result.success) {
        setShowOtpModal(true);
      } else {
        alert(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const email = registerForm.getValues("email");
      const result = await verifyOtp(email, otpValue);

      if (result.success) {
        setEmailVerified(true);
        setShowOtpModal(false);
      } else {
        setOtpError(result.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP Verification error:", error);
      setOtpError(
        error.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterContinue = async (data) => {
    if (!emailVerified) {
      alert("Please verify your email address before continuing.");
      return;
    }
    setCompletedSteps((prev) => Array.from(new Set([...prev, "mobile"])));
    setCurrentStep("email"); // Move to ID & Signature step (Sidebar ID: 'email')
  };

  const handleEditEmail = () => {
    if (
      window.confirm(
        "Editing your email will require re-verification. Continue?",
      )
    ) {
      setEmailVerified(false);
    }
  };

  const handleIdSigSubmit = async () => {
    // Validate ID fields
    const isValid = await businessForm.trigger([
      "businessCategory",
      "ownerName",
      "gstin",
      "panNumber",
    ]);
    if (isValid) {
      if (!signature) {
        alert("Please add your e-signature to continue.");
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        const businessData = businessForm.getValues();

        formData.append(
          "displayName",
          businessData.businessName || businessData.ownerName,
        ); // Fallback if not set yet, though displayName is in next step?
        // Wait, "displayName" is in "Store & Pickup Details" (step 3). API asks for it here?
        // The user request says: "this is the api to upload the data of the ID and signature page for business details".
        // But `displayName` is usually asked later.
        // Let's check the schema. `displayName` isn't in `businessDetailsSchema` (id part).
        // It is in the NEXT step.
        // However, the API endpoint `/api/v1/retailer/data` seems to be for saving "Business Details" which might include ID & Signature.
        // If the API requires `displayName` NOW, we might need to clarify or use a placeholder or ask for it now.
        // OR, maybe this API is called AFTER the next step?
        // User said: "just after the business details of all categories data , we have to take the signature... implement this also".
        // And "this is the api to upload the data of the ID and signature page".
        // It seems they want to save this step's data.
        // If `displayName` is mandatory field in backend, it might fail if missing.
        // I'll append `ownerName` as `displayName` for now if it's missing, or just send empty string.
        // Update: I'll use `ownerName` as fallback.

        formData.append("ownerName", businessData.ownerName);
        formData.append("gstin", businessData.gstin);
        if (businessData.panNumber)
          formData.append("pan", businessData.panNumber);

        // Handle Signature
        let signatureFile;
        if (signature.type === "drawn") {
          signatureFile = dataURLtoFile(signature.data, "signature.png");
        } else if (signature.type === "typed") {
          signatureFile = textToImageFile(signature.data, "signature.png");
        }

        formData.append("signature", signatureFile);

        const response = await apiClient.post("/retailer/data", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Business details saved:", response.data);

        setCompletedSteps((prev) => Array.from(new Set([...prev, "email"])));
        setCurrentStep("business"); // Move to Store details
      } catch (error) {
        console.error("Failed to save business details:", error);
        alert(
          error.response?.data?.message ||
            "Failed to save details. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStoreSubmit = async (data) => {
    whClearError();

    // All form values are already synced to the warehouse store.
    // Now call the API.
    const result = await createWarehouse();

    if (result.success) {
      setCompletedSteps((prev) => Array.from(new Set([...prev, "business"])));
      completeOnboarding();
      setShowSuccessOverlay(true);
    }
    // On failure, whError will be set and displayed in the UI.
  };

  const handleSuccessLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const goBack = () => {
    const stepOrder = ["mobile", "email", "business"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const RightSidebar = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {/* <Button variant="outline" size="sm" className="w-full justify-center">
          Go to Listing →
        </Button> */}
        <Button variant="orange" size="sm" className="w-full justify-center">
          GO LIVE NOW
        </Button>
      </div>
      {/* Same sidebar content */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-[#212121] mb-2">Do you need help?</h4>
        <p className="text-sm text-[#878787] mb-3">
          Our team of specialists would be happy to help you setup your shop on
          Bukizz.
        </p>
        <p className="text-sm text-[#878787] mb-3">
          If you would like their assistance,
        </p>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setContactDropdownOpen(!contactDropdownOpen)}
          >
            Need Help?
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform ${contactDropdownOpen ? "rotate-180" : ""}`}
            />
          </Button>

          {/* Dropdown (Click triggered) */}
          {contactDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-center">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Contact Support
                </div>
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => window.open("tel:+919369467134")}
                  >
                    <Phone className="w-4 h-4 text-[#2874F0]" />
                    <span className="text-sm font-medium text-slate-700">
                      +91 9369 467134
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-center gap-2 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => window.open("mailto:bukizzstore@gmail.com")}
                  >
                    <Mail className="w-4 h-4 text-[#2874F0]" />
                    <span className="text-sm font-medium text-slate-700">
                      bukizzstore@gmail.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ... other standard sidebar widgets ... */}
    </div>
  );

  const BreadcrumbHeader = () => {
    // Map current step to simplified phases if needed, or just allow OnboardingSidebar to handle detailed progress.
    // Keeping it simple for now, but aligned with new steps.
    return (
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              completedSteps.includes("mobile")
                ? "bg-[#26A541]"
                : "bg-[#2874F0]"
            }`}
          >
            {completedSteps.includes("mobile") ? (
              <CheckCircle className="w-3 h-3 text-white" />
            ) : (
              <span className="text-xs text-white font-medium">1</span>
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              completedSteps.includes("mobile")
                ? "text-[#26A541]"
                : "text-[#212121]"
            }`}
          >
            EMAIL & PASSWORD
          </span>
        </div>
        <div className="h-px w-8 bg-gray-300" />
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              completedSteps.includes("email")
                ? "bg-[#26A541]"
                : currentStep === "email" || currentStep === "business"
                  ? "bg-[#2874F0]"
                  : "bg-gray-300"
            }`}
          >
            {completedSteps.includes("email") &&
            completedSteps.includes("business") ? (
              <CheckCircle className="w-3 h-3 text-white" />
            ) : (
              <span className="text-xs text-white font-medium">2</span>
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              completedSteps.includes("email")
                ? "text-[#26A541]"
                : currentStep === "email" || currentStep === "business"
                  ? "text-[#212121]"
                  : "text-[#878787]"
            }`}
          >
            BUSINESS DETAILS
          </span>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "mobile":
        return (
          <div className="animate-fade-in relative">
            <EmailOtpModal
              isOpen={showOtpModal}
              onClose={() => setShowOtpModal(false)}
              email={registerForm.getValues("email")}
              onVerify={handleVerifyOtp}
              onResend={handleSendOtp}
              isLoading={isLoading}
              error={otpError}
            />

            <h1 className="text-2xl font-semibold text-[#212121] mb-6">
              Hello
            </h1>
            <h2 className="text-lg font-medium text-[#212121] mb-4">
              Register as Retailer
            </h2>

            <form
              onSubmit={registerForm.handleSubmit(handleRegisterContinue)}
              className="space-y-5"
            >
              <Input
                placeholder="Full Name"
                className="flex-1"
                {...registerForm.register("fullName")}
                error={registerForm.formState.errors.fullName?.message}
                leftElement={<User className="w-5 h-5 text-[#878787]" />}
              />
              <Input
                placeholder="+91 Enter Mobile Number"
                className="flex-1"
                {...registerForm.register("mobile")}
                error={registerForm.formState.errors.mobile?.message}
                leftElement={<Phone className="w-5 h-5 text-[#878787]" />}
              />
              <Input
                type="email"
                placeholder="Email ID"
                className="flex-1"
                {...registerForm.register("email")}
                error={registerForm.formState.errors.email?.message}
                leftElement={<Mail className="w-5 h-5 text-[#878787]" />}
                disabled={emailVerified}
                rightElement={
                  emailVerified ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-[#E8F5EA] text-[#26A541] px-2 py-0.5 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <button
                        type="button"
                        onClick={handleEditEmail}
                        className="text-[#2874F0] text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#2874F0] text-sm font-medium hover:underline"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify"}
                    </button>
                  )
                }
              />
              <Input
                type="password"
                placeholder="Create Password"
                {...registerForm.register("password")}
                error={registerForm.formState.errors.password?.message}
                leftElement={<Lock className="w-5 h-5 text-[#878787]" />}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                {...registerForm.register("confirmPassword")}
                error={registerForm.formState.errors.confirmPassword?.message}
                leftElement={<Lock className="w-5 h-5 text-[#878787]" />}
              />
              <p className="text-xs text-[#878787]">
                By continuing, I agree to Bukizz&apos;s{" "}
                <Link
                  to="/terms-of-service"
                  className="text-[#2874F0] hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                &{" "}
                <Link
                  to="/privacy-policy"
                  className="text-[#2874F0] hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
              <Button type="submit" className="w-auto">
                Register & Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        );

      case "email": // ID & Signature Verification (Step 2 in Sidebar)
        return (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-[#212121] mb-2">
              Business Details
            </h1>
            <div className="mb-6 bg-green-50 p-3 rounded-md border border-green-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                Email Verified Successfully
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-[#212121] mb-4">
                  ID & Signature Verification
                </h2>
                <BusinessCategoryToggle
                  value={businessCategory}
                  onChange={(value) => {
                    setBusinessCategory(value);
                    businessForm.setValue("businessCategory", value);
                  }}
                  error={
                    businessForm.formState.errors.businessCategory?.message
                  }
                />
              </div>

              <Input
                label="Owner Name"
                placeholder="Enter Owner Name"
                {...businessForm.register("ownerName")}
                error={businessForm.formState.errors.ownerName?.message}
              />

              <Input
                label="Enter GSTIN"
                placeholder="Enter GSTIN"
                {...businessForm.register("gstin")}
                error={businessForm.formState.errors.gstin?.message}
              />

              <Input
                label="Enter PAN Number"
                placeholder="Enter PAN Number"
                {...businessForm.register("panNumber")}
                error={businessForm.formState.errors.panNumber?.message}
              />

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-[#212121] mb-4">
                  Add Your e-Signature
                </h3>

                {signature ? (
                  <div className="relative border rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center group">
                    {signature.type === "drawn" ? (
                      <img
                        src={signature.data}
                        alt="Signature"
                        className="max-h-24"
                      />
                    ) : (
                      <p
                        className="text-4xl text-[#212121]"
                        style={{ fontFamily: "cursive" }}
                      >
                        {signature.data}
                      </p>
                    )}
                    <button
                      onClick={() => setSignature(null)}
                      className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Click X to remove and add new
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureTab("draw");
                        setShowSignatureModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 border border-gray-300 rounded-lg text-[#2874F0] font-medium hover:bg-blue-50 transition-colors"
                    >
                      <PenTool className="w-5 h-5" />
                      Draw your signature
                    </button>
                    <span className="text-sm text-gray-500">OR</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureTab("create");
                        setShowSignatureModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 border border-gray-300 rounded-lg text-[#2874F0] font-medium hover:bg-blue-50 transition-colors"
                    >
                      <Type className="w-5 h-5" />
                      Choose your signature
                    </button>
                  </div>
                )}
              </div>

              <Button type="button" onClick={handleIdSigSubmit}>
                Save & Continue <ArrowRight className="w-4 h-4" />
              </Button>

              <SignatureModal
                isOpen={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onSave={(data) => setSignature(data)}
                defaultTab={signatureTab}
              />
            </div>
          </div>
        );

      case "business": // Store & Pickup Details (Step 3 in Sidebar)
        return (
          <div className="animate-fade-in">
            <Button variant="ghost" className="mb-4 pl-0" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-semibold text-[#212121] mb-2">
              Store & Pickup Details
            </h1>
            <p className="text-sm text-[#878787] mb-6">
              Set up your warehouse / store details and pickup address for order
              fulfilment.
            </p>

            {/* API error banner */}
            {whError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {whError}
              </div>
            )}

            {/* Already created banner */}
            {whIsCreated && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100 text-green-800 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                Warehouse already saved. You can update and re-submit, or
                continue to the next step.
              </div>
            )}

            <form
              onSubmit={warehouseForm.handleSubmit(handleStoreSubmit)}
              className="space-y-6"
            >
              {/* ── Store / Warehouse Info ──────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#212121]">
                  <Store className="w-5 h-5 text-[#2874F0]" />
                  <h2 className="text-lg font-medium">Store Information</h2>
                </div>

                <Input
                  label="Store / Warehouse Name *"
                  placeholder="e.g. My Main Warehouse"
                  {...warehouseForm.register("name")}
                  error={warehouseForm.formState.errors.name?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Email"
                    placeholder="warehouse@example.com"
                    type="email"
                    {...warehouseForm.register("contactEmail")}
                    error={warehouseForm.formState.errors.contactEmail?.message}
                    leftElement={<Mail className="w-4 h-4 text-[#878787]" />}
                  />
                  <Input
                    label="Contact Phone"
                    placeholder="+91-9999999999"
                    {...warehouseForm.register("contactPhone")}
                    error={warehouseForm.formState.errors.contactPhone?.message}
                    leftElement={<Phone className="w-4 h-4 text-[#878787]" />}
                  />
                </div>

                <Input
                  label="Website"
                  placeholder="https://example.com"
                  {...warehouseForm.register("website")}
                  error={warehouseForm.formState.errors.website?.message}
                  leftElement={<Globe className="w-4 h-4 text-[#878787]" />}
                />
              </div>

              {/* ── Pickup / Warehouse Address ─────────────── */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-[#212121]">
                  <MapPin className="w-5 h-5 text-[#2874F0]" />
                  <h2 className="text-lg font-medium">Pickup Address</h2>
                </div>

                <Input
                  label="Address Line 1 *"
                  placeholder="123 Street, Building Name"
                  {...warehouseForm.register("address.line1")}
                  error={warehouseForm.formState.errors.address?.line1?.message}
                />

                <Input
                  label="Address Line 2"
                  placeholder="Floor, Landmark (optional)"
                  {...warehouseForm.register("address.line2")}
                  error={warehouseForm.formState.errors.address?.line2?.message}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    placeholder="e.g. Delhi"
                    {...warehouseForm.register("address.city")}
                    error={
                      warehouseForm.formState.errors.address?.city?.message
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-1.5">
                      State *
                    </label>
                    <select
                      {...warehouseForm.register("address.state")}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors bg-white ${
                        warehouseForm.formState.errors.address?.state
                          ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-gray-300 focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]"
                      }`}
                    >
                      <option value="">Select State</option>
                      {[
                        "Andhra Pradesh",
                        "Arunachal Pradesh",
                        "Assam",
                        "Bihar",
                        "Chhattisgarh",
                        "Goa",
                        "Gujarat",
                        "Haryana",
                        "Himachal Pradesh",
                        "Jharkhand",
                        "Karnataka",
                        "Kerala",
                        "Madhya Pradesh",
                        "Maharashtra",
                        "Manipur",
                        "Meghalaya",
                        "Mizoram",
                        "Nagaland",
                        "Odisha",
                        "Punjab",
                        "Rajasthan",
                        "Sikkim",
                        "Tamil Nadu",
                        "Telangana",
                        "Tripura",
                        "Uttar Pradesh",
                        "Uttarakhand",
                        "West Bengal",
                        "Andaman and Nicobar Islands",
                        "Chandigarh",
                        "Dadra and Nagar Haveli and Daman and Diu",
                        "Delhi",
                        "Jammu and Kashmir",
                        "Ladakh",
                        "Lakshadweep",
                        "Puducherry",
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {warehouseForm.formState.errors.address?.state && (
                      <p className="mt-1 text-xs text-red-500">
                        {warehouseForm.formState.errors.address.state.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Postal Code (Pincode) *"
                    placeholder="e.g. 110001"
                    {...warehouseForm.register("address.postalCode")}
                    error={
                      warehouseForm.formState.errors.address?.postalCode
                        ?.message
                    }
                  />
                  <Input
                    label="Country"
                    placeholder="India"
                    {...warehouseForm.register("address.country")}
                    error={
                      warehouseForm.formState.errors.address?.country?.message
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Latitude (optional)"
                    placeholder="e.g. 28.6139"
                    type="number"
                    step="any"
                    {...warehouseForm.register("address.lat", {
                      valueAsNumber: true,
                    })}
                    error={warehouseForm.formState.errors.address?.lat?.message}
                  />
                  <Input
                    label="Longitude (optional)"
                    placeholder="e.g. 77.2090"
                    type="number"
                    step="any"
                    {...warehouseForm.register("address.lng", {
                      valueAsNumber: true,
                    })}
                    error={warehouseForm.formState.errors.address?.lng?.message}
                  />
                </div>
              </div>

              {/* ── Submit ────────────────────────────────── */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={goBack}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={whIsSubmitting}
                  variant="success"
                >
                  {whIsSubmitting
                    ? "Saving…"
                    : whIsCreated
                      ? "Update & Complete"
                      : "Save & Complete Registration"}
                  {!whIsSubmitting && <CheckCircle className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </div>
        );
    }
  };

  // ── Success Overlay ──────────────────────────────────────────────────
  if (showSuccessOverlay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
        <div className="w-full max-w-lg animate-fade-in">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-violet-500 to-indigo-500" />

            <div className="p-8 sm:p-10 text-center">
              {/* Animated check icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Registration Complete!
              </h2>
              <p className="text-slate-500 mb-6">
                Your store has been successfully registered on Bukizz.
              </p>

              {/* Info card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900 mb-1">
                      Pending Admin Approval
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Your application is now under review by our admin team.
                      You will receive a<strong> confirmation email</strong>{" "}
                      once your account has been approved. This typically takes{" "}
                      <strong>24–48 hours</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  What happens next?
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      text: "Admin reviews your business details & documents",
                    },
                    {
                      step: "2",
                      text: "You receive an approval email from Bukizz",
                    },
                    {
                      step: "3",
                      text: "Log in and start managing your inventory & orders",
                    },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {step}
                      </div>
                      <p className="text-sm text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logout button */}
              <Button
                onClick={handleSuccessLogout}
                className="w-full"
                size="lg"
              >
                <LogOut className="w-5 h-5" />
                Got it, Sign me out
              </Button>

              <p className="mt-4 text-xs text-slate-400">
                You will be redirected to the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F1F3F6]">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-full">
          <OnboardingSidebar
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>
      </div>
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <BreadcrumbHeader />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
              {renderStepContent()}
            </div>
            <div className="hidden lg:block">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
