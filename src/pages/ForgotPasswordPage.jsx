import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await forgotPassword(data.email);
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-12">
            <img
              src="/logo.svg"
              alt="Bukizz Logo"
              className="h-16 w-auto brightness-0 invert"
            />
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Reset your
            <br />
            <span className="text-yellow-300">Password</span>
          </h1>

          <p className="text-lg text-blue-100 mb-10 max-w-md">
            Securely access your account to manage your school supplies
            business.
          </p>

          <div className="space-y-6">
            {[
              {
                title: "0% Commission",
                desc: "Keep 100% of your profits on direct sales.",
              },
              {
                title: "Fast Settlements",
                desc: "Get paid within 7-10 days of delivery.",
              },
              {
                title: "School Network",
                desc: "Exclusive access to partner schools & mandates.",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-blue-100 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <img
              src="/logo-small.png"
              alt="Bukizz Logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-slate-900">Bukizz</span>
          </div>

          {submitted ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Check your email
              </h2>
              <p className="text-slate-500 mb-8">
                We&apos;ve sent a password reset link to your email address.
                Please check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Forgot your password?
                </h2>
                <p className="text-slate-500">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@business.com"
                  icon={<Mail className="w-5 h-5" />}
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting}
                >
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-violet-600 hover:text-violet-700 font-medium"
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
