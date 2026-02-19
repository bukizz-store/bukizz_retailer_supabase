import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Store, Truck, IndianRupee, RefreshCw } from "lucide-react";

export default function SellerPolicyPage() {
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
                Seller Policy
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
                Seller Policy
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
                  This Seller Policy outlines the rights and obligations of
                  vendors selling on the Bukizz Marketplace. Our goal is to
                  create a trusted and efficient platform for both sellers and
                  school/student buyers.
                </p>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Seller Eligibility & Onboarding */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Store className="h-5 w-5" />
                <h3 className="text-lg font-semibold">1. Seller Eligibility</h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>To become a seller on Bukizz:</p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    You must have a valid business registration (GSTIN or PAN,
                    depending on category).
                  </li>
                  <li>
                    You must sell genuine, new, and high-quality school
                    supplies.
                  </li>
                  <li>
                    All products must comply with Bukizz's prohibited items
                    policy.
                  </li>
                </ul>
              </div>
            </section>

            {/* Payments & Settlements */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <IndianRupee className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  2. Payments & Settlements
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <p>
                  <strong>0% Commission:</strong> Bukizz charges 0% commission
                  on direct sales, allowing you to retain higher profits.
                </p>
                <p>
                  <strong>Payment Gateway:</strong> We use{" "}
                  <strong>Razorpay</strong> for secure and reliable payment
                  processing from customers.
                </p>
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    <strong>Settlement Cycle:</strong> Payments are settled to
                    your registered bank account within{" "}
                    <strong>7-10 days</strong> from the date of
                    dispatch/delivery confirmation.
                  </li>
                  <li>
                    Bukizz reserves the right to withhold payments in cases of
                    customer disputes or suspected fraud.
                  </li>
                </ul>
              </div>
            </section>

            {/* Order Fulfillment */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Truck className="h-5 w-5" />
                <h3 className="text-lg font-semibold">3. Order Fulfillment</h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    Sellers must pack orders securely to prevent damage during
                    transit.
                  </li>
                  <li>
                    Orders must be marked as 'Ready to Ship' within the agreed
                    SLA (Service Level Agreement).
                  </li>
                  <li>
                    Late dispatch may attract penalties or affect your seller
                    rating.
                  </li>
                </ul>
              </div>
            </section>

            {/* Returns & Cancellations */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  4. Returns & Cancellations
                </h3>
              </div>
              <div className="space-y-4 pl-7 text-slate-600">
                <ul className="list-disc list-outside space-y-2 ml-4">
                  <li>
                    <strong>Customer Returns:</strong> Sellers must accept
                    returns for defective, damaged, or incorrect products
                    reported within the return window.
                  </li>
                  <li>
                    <strong>Refunds:</strong> Refunds are processed back to the
                    customer's original payment method via Razorpay once the
                    return is verified.
                  </li>
                  <li>
                    Sellers can raise a dispute if a returned item is received
                    in damaged condition due to customer negligence.
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-2">
                Seller Support
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Need help with your seller account?
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
