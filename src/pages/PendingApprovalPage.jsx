import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert, LogOut, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import useAuthStore from "@/store/authStore";

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { logout, verificationStatus } = useAuthStore();

  const status = verificationStatus?.status || "pending";
  const message =
    verificationStatus?.message || "Your account is pending admin approval.";
  const reason = verificationStatus?.deactivationReason;

  const isDeactivated = status === "deactivated";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.svg" alt="Bukizz Logo" className="h-16 w-auto" />
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Account{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {isDeactivated ? "Deactivated" : "Under Review"}
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8">
            {isDeactivated
              ? "Your account has been deactivated by the admin. Please reach out to our support team for assistance."
              : "Our team is reviewing your application. This usually takes 24-48 hours. We'll notify you once your account is approved."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">24-48h</p>
              <p className="text-sm text-slate-400">Typical review time</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-white">Email</p>
              <p className="text-sm text-slate-400">Notification on approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Status Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <img
              src="/logo-small.png"
              alt="Bukizz Logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Bukizz
            </span>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isDeactivated
                  ? "bg-red-50 dark:bg-red-950/30"
                  : "bg-amber-50 dark:bg-amber-950/30"
              }`}
            >
              {isDeactivated ? (
                <ShieldAlert className="w-10 h-10 text-red-500" />
              ) : (
                <Clock className="w-10 h-10 text-amber-500" />
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {isDeactivated ? "Account Deactivated" : "Pending Approval"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">{message}</p>
          </div>

          {/* Reason card (for deactivated accounts) */}
          {isDeactivated && reason && reason !== "unauthorized" && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Reason:
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">{reason}</p>
            </div>
          )}

          {/* Status badge */}
          {!isDeactivated && (
            <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Your application is being reviewed by our admin team
                </p>
              </div>
            </div>
          )}

          {/* Contact support */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Need help? Contact Support
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@bukizz.com"
                className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                <Mail className="w-4 h-4" />
                support@bukizz.com
              </a>
              <a
                href="tel:+911234567890"
                className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
              >
                <Phone className="w-4 h-4" />
                +91 12345 67890
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out & Try Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
