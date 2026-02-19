import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, ArrowRight } from "lucide-react";
import useAuthStore from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, runPostLoginChecks, error, clearError } = useAuthStore();

  const from = location.state?.from?.pathname || "/dashboard/overview";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    clearError();
    const result = await login(data.email, data.password);
    if (!result.success) return;

    // Run post-login verification checks
    const checks = await runPostLoginChecks();

    switch (checks.destination) {
      case "dashboard":
        navigate(from === "/login" ? "/dashboard/overview" : from, {
          replace: true,
        });
        break;
      case "onboarding":
        // Profile incomplete → send to register page (ID & Signature step)
        navigate("/register", {
          replace: true,
          state: {
            resumeOnboarding: true,
            missingFields: checks.missingFields,
          },
        });
        break;
      case "onboarding-warehouse":
        // Profile complete but no warehouse → send to register page (Store & Pickup step)
        navigate("/register", {
          replace: true,
          state: { resumeOnboarding: true, resumeStep: "business" },
        });
        break;
      case "pending":
      default:
        // Pending approval or deactivated
        navigate("/pending-approval", { replace: true });
        break;
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
              className="h-16 w-auto  "
            />
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Grow your business with
            <br />
            <span className="text-yellow-300">Bukizz Store</span>
          </h1>

          <p className="text-lg text-blue-100 mb-10 max-w-md">
            Join India's most trusted marketplace for school supplies. Connect
            directly with parents and schools.
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

      {/* Right side - Login form */}
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

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">
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

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                {...register("password")}
                error={errors.password?.message}
              />
              <div className="mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              Register as a vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
