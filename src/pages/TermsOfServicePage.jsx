import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Scale,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Bukizz Logo" className="h-8 w-auto" />
              <div className="h-4 w-px bg-slate-300 mx-2" />
              <h1 className="text-lg font-semibold text-slate-800">
                Terms of Service
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Terms of Service
              </h2>
              <p className="text-slate-500 text-sm">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Welcome to Bukizz. These Terms of Service ("Terms") govern
                  your use of the Bukizz website and platform. By accessing or
                  using our services, you agree to be bound by these Terms.
                </p>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Account Registration */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  1. Account Registration
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  To use certain features of the platform, you must register for
                  an account. You agree to:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    Provide accurate, current, and complete information during
                    the registration process.
                  </li>
                  <li>
                    Maintain the security of your password and accept all risks
                    of unauthorized access to your account.
                  </li>
                  <li>
                    Notify us immediately if you discover or suspect any
                    security breaches related to your account.
                  </li>
                </ul>
              </div>
            </section>

            {/* Use of Services */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Scale className="h-5 w-5" />
                <h3 className="text-lg font-semibold">2. Use of Services</h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  Bukizz grants you a limited, non-exclusive, non-transferable,
                  and revocable license to use our platform for its intended
                  purposes. You agree not to:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    Use the platform for any illegal purpose or in violation of
                    any local, state, national, or international law.
                  </li>
                  <li>
                    Violate, or encourage others to violate, any right of a
                    third party, including by infringing or misappropriating any
                    third-party intellectual property right.
                  </li>
                  <li>
                    Interfere with security-related features of the platform.
                  </li>
                </ul>
              </div>
            </section>

            {/* Payments & Razorpay */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <CreditCard className="h-5 w-5" />
                <h3 className="text-lg font-semibold">3. Payments & Billing</h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  <strong>Payment Processing:</strong> All payments on Bukizz
                  are processed effectively and securely through{" "}
                  <strong>Razorpay</strong>, our trusted third-party payment
                  gateway. By making a purchase, you agree to Razorpay's terms
                  and conditions and privacy policy.
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    We accept major credit cards, debit cards, UPI, and other
                    payment methods supported by Razorpay.
                  </li>
                  <li>
                    Bukizz does not store your complete card details or banking
                    information on our servers.
                  </li>
                  <li>
                    You are responsible for any fees or charges incurred to
                    access our services through an Internet access provider or
                    other third-party service.
                  </li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  4. Limitation of Liability
                </h3>
              </div>
              <div className="pl-7 text-slate-600">
                <p>
                  To the fullest extent permitted by law, in no event will
                  Bukizz be liable to you for any indirect, incidental, special,
                  consequential or punitive damages (including damages for loss
                  of profits, goodwill, or any other intangible loss) arising
                  out of or relating to your access to or use of, or your
                  inability to access or use, the platform.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">
                Have questions?
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                If you have any questions regarding these Terms, please contact
                us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">Email:</span>
                  <a
                    href="mailto:bukizzstore@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    bukizzstore@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">Phone:</span>
                  <a
                    href="tel:+919369467134"
                    className="text-blue-600 hover:underline"
                  >
                    +91 9369 467134
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 Bukizz Technologies Pvt. Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
