import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Package,
  CheckCircle,
  Users,
  ArrowRight,
  Truck,
  HeadphonesIcon,
  Wallet,
  Smartphone,
  Calculator,
  IndianRupee,
} from "lucide-react";

const benefits = [
  // {
  //   icon: GraduationCap,
  //   title: "Sell Across India",
  //   description: "Reach over 50 crore+ customers across 27000+ pincodes",
  // },
  {
    icon: Calculator,
    title: "Higher Profits",
    description: "With 0% commission*, you take 100% profits with you",
  },
  {
    icon: Users,
    title: "Account Management",
    description: "Our Dedicated managers will help your business on Bukizz",
  },
  // {
  //   icon: Truck,
  //   title: "Lower Return Charges",
  //   description:
  //     "With our flat and low return charges, ship your products stress-free",
  // },
  // {
  //   icon: Calculator,
  //   title: "Simple Pricing Calculator",
  //   description:
  //     "Use our simple pricing calculator to decide the best and competitive selling price for your product",
  // },
  {
    icon: HeadphonesIcon,
    title: "24×7 Seller Support",
    description:
      "All your queries and issues are answered by our dedicated Seller Support Team",
  },
  {
    icon: IndianRupee,
    title: "Fast & Regular Payments",
    description: "Get payments as fast as 7-10 days from the date of dispatch",
  },
  // {
  //   icon: Smartphone,
  //   title: "Business on the go",
  //   description:
  //     "Download our Bukizz Seller App to manage your business anywhere, anytime",
  // },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Bukizz Logo" className="h-9 w-auto" />
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Start Selling</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#E8F0FE] to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-2 text-sm text-[#878787] mb-4">
                <span className="text-[#26A541] font-medium">
                  Trusted by many vendors across India
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#212121] mb-4">
                Sell School Supplies Directly to Parents
              </h1>
              <p className="text-[#878787] mb-6">
                Join India&apos;s fastest-growing platform for school vendors.
                Sell books, uniforms, and stationery to thousands of parents
                looking for quality school supplies.
              </p>

              {/* <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number *"
                    className="flex-1 h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/10"
                  />
                  <Button>Send OTP</Button>
                </div>
                <p className="text-sm text-[#2874F0]">
                  Please verify your mobile number through OTP before you
                  register
                </p>
              </div> */}

              <div className="mt-6 flex gap-4">
                <Link to="/register" className="flex-1">
                  <Button className="w-full" size="lg">
                    Register as Vendor
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Testimonial & Stats */}
            <div className="space-y-6">
              {/* Testimonial */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFE500] rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍💼</span>
                  </div>
                  <div>
                    <p className="text-[#212121] mb-2">
                      &quot;Starting with 1, Bukizz helped me expand to 6
                      categories with 5x growth year on year!&quot;
                    </p>
                    <p className="text-sm text-[#878787]">
                      Shivam Varshney, Gurugram
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div className="bg-gradient-to-r from-[#2874F0] to-[#1F5FD9] rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#FFE500] font-medium">
                    #KuchKhaasKamao
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    Bukizz Seller Hub
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  HAR CHEEZ BECHO SHAAN SE
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  Sell everything with pride on Bukizz
                </p>
                {/* <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-bold">50 Crore+</span>
                    <p className="text-white/70">Customers</p>
                  </div>
                  <div>
                    <span className="font-bold">19000+</span>
                    <p className="text-white/70">Pincodes</p>
                  </div>
                  <div>
                    <span className="font-bold">14 Lakh+</span>
                    <p className="text-white/70">Sellers</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why sell section */}
      <section className="py-16 bg-[#F1F3F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#212121] text-center mb-12">
            Why sell on Bukizz?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFF8E1] rounded-full flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-[#FF9F00]" />
                </div>
                <h3 className="text-lg font-semibold text-[#212121] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#878787]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-[#2874F0]" />
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">
                School Partnerships
              </h3>
              <p className="text-[#878787]">
                Get exclusive access to sell official school booksets and
                uniforms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#E8F5EA] rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-[#26A541]" />
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">
                Open Marketplace
              </h3>
              <p className="text-[#878787]">
                List general stationery and supplies for all students.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-[#FFF4E5] rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[#FF9F00]" />
              </div>
              <h3 className="text-xl font-semibold text-[#212121] mb-2">
                Easy Verification
              </h3>
              <p className="text-[#878787]">
                Simple registration with GSTIN or PAN based on your category.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#2874F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of vendors already selling on Bukizz
          </p>
          <Link to="/register">
            <Button variant="secondary" size="xl">
              Start Selling Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212121] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Bukizz Logo" className="h-8 w-auto" />
              </div>
              <p className="text-sm text-gray-400">
                India&apos;s trusted platform for school supplies vendors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                {/* <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li> */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">Phone:</span>
                  <a href="tel:+919369467134" className="hover:text-white">
                    +91 9369 467134
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">Email:</span>
                  <a
                    href="mailto:bukizzstore@gmail.com"
                    className="hover:text-white"
                    target="_top"
                  >
                    bukizzstore@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/seller-policy" className="hover:text-white">
                    Seller Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 Bukizz Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
