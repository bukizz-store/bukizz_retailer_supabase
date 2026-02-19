import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                Privacy Policy
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
                Privacy Policy
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
                  Bukizz Store ("Bukizz") values your trust and
                  is committed to protecting your privacy. This Privacy Policy
                  describes how we collect, use, share, and protect your
                  personal information when you use our website and services.
                </p>
                <p>
                  By using Bukizz, you agree to the terms of this Privacy
                  Policy. If you do not agree, please do not use our platform.
                </p>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Information We Collect */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  1. Information We Collect
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  We collect information to provide better services to all our
                  users. This includes:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    <strong>Personal Information:</strong> Name, address, phone
                    number, email address, and payment details when you register
                    or make a purchase.
                  </li>
                  <li>
                    <strong>School & Student Information:</strong> School name,
                    grade, section, and student details necessary for fulfilling
                    specific school orders (e.g., uniforms, booksets).
                  </li>
                  <li>
                    <strong>Transactional Information:</strong> Order history,
                    billing address, and delivery preferences.
                  </li>
                  <li>
                    <strong>Device Information:</strong> IP address, device
                    type, browser settings, and operating system.
                  </li>
                </ul>
              </div>
            </section>

            {/* How We Use Data */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  2. How We Use Your Information
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    To process and fulfill your orders for school supplies.
                  </li>
                  <li>To verify your identity and facilitate payments.</li>
                  <li>
                    To improve our platform, customer service, and user
                    experience.
                  </li>
                  <li>
                    To communicate with you regarding updates, offers, and order
                    status.
                  </li>
                  <li>
                    To prevent fraud and ensure the security of our platform.
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  3. Sharing of Information
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  We do not sell your personal information. We may share your
                  information with:
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    <strong>Third-Party Service Providers:</strong> Logistics
                    partners, payment gateways, and support services to fulfill
                    your orders.
                  </li>
                  <li>
                    <strong>Schools:</strong> If required for verification or
                    distribution of specific school supplies.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> If required by law or
                    to protect the rights and safety of Bukizz and its users.
                  </li>
                </ul>
              </div>
            </section>

            {/* Security */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Lock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">4. Data Security</h3>
              </div>
              <div className="pl-7 text-slate-600">
                <p>
                  We implement reasonable security practices and procedures to
                  protect your personal information from unauthorized access,
                  use, or disclosure. However, no method of transmission over
                  the internet is 100% secure.
                </p>
              </div>
            </section>

            {/* Updates */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-l-4 border-blue-500 pl-3">
                Updates to this Policy
              </h3>
              <p className="text-slate-600">
                We may update this Privacy Policy from time to time. We
                encourage you to review this page periodically for any changes.
                Your continued use of the platform after changes constitutes
                your acceptance of the new policy.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">
                Have questions?
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                If you have any questions or concerns regarding this Privacy
                Policy, please contact us.
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

function Users({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
