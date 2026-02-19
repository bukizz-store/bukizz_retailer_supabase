import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import useAuthStore from "@/store/authStore";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await resetPassword(resetToken, data.newPassword);
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  // No token in URL — show error
  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            This password reset link is invalid or missing a token. Please
            request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Request new reset link
          </Link>
        </div>
      </div>
    );
  }

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
            Create a new{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              password
            </span>
          </h1>

          <p className="text-lg text-slate-400">
            Choose a strong password that you haven&apos;t used before.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
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

          {submitted ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Password reset successful!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Your password has been updated. Redirecting you to sign in...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Set new password
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Your new password must be at least 6 characters long.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  {...register("newPassword")}
                  error={errors.newPassword?.message}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-5 h-5" />}
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting}
                >
                  Reset Password
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
