import React, { useState, useEffect } from "react";
import useOrderStore from "@/store/orderStore";
import { useWarehouse } from "@/context/WarehouseContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Download,
  Calendar,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy Data (Partial)

const statusBadgeVariant = {
  delivered: "delivered",
  processing: "processing",
  shipped: "shipped",
  returned: "refunded", // Using refunded variant for returned for distinct color
  cancelled: "cancelled",
};

const paymentStatusVariant = {
  settled: "delivered",
  pending: "warning",
};

const invoiceBadgeVariant = {
  generated: "delivered",
  not_generated: "default",
};

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState("dates");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { orders, fetchOrders, setLimit, isLoading } = useOrderStore();
  const { activeWarehouse } = useWarehouse();

  useEffect(() => {
    if (activeWarehouse?.id) {
      setLimit(1000); // Fetch a large number to ensure we get all orders for the summary
      fetchOrders(activeWarehouse.id);
    }
    // Cleanup limit if navigating away not strictly necessary as ActiveOrdersPage sets it
  }, [activeWarehouse?.id, fetchOrders, setLimit]);

  // Compute stats
  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalOrdersCount = validOrders.length;

  const totalSalesAmount = validOrders.reduce((sum, order) => {
    return sum + Number(order.totalAmount || 0);
  }, 0);

  // Format amount compactly (e.g., 58000 -> 58.0K)
  const formatAmountK = (num) => {
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString()}`;
  };

  const SETTLEMENT_STATS = [
    {
      title: "Total Orders",
      value: totalOrdersCount.toString(),
      subtext: "Excl. cancelled",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: formatAmountK(totalSalesAmount),
      subtext: "Delivered & Processing",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "To Be Settled",
      // value: "₹0.0K",
      value: "NA",
      subtext: "Incl. return deductions",
      icon: Wallet,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Last Settlement",
      value: "20 Feb 2026",
      subtext: "Most recent payout",
      icon: Clock,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Next Settlement",
      value: "27 Feb 2026",
      subtext: "(₹6.9K) Adjusted for returns",
      icon: Calendar,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  // Helper to shorten ID
  const shortenOrderId = (id) => {
    if (!id) return "";
    if (id.length <= 12) return id;
    const short = id.replace(/-/g, "").slice(-8).toUpperCase();
    return `#${short}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-slate-500 mb-2">
        <span className="hover:text-blue-600 cursor-pointer">Home</span>
        <span className="mx-2">›</span>
        <span className="text-slate-900 font-medium">Settlements</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Settlements
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Track your school payouts and settlement status
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("dates")}
            className={cn(
              "px-6 py-4 text-sm font-medium transition-all relative",
              activeTab === "dates"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filter by Dates
            </div>
            {activeTab === "dates" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("schools")}
            className={cn(
              "px-6 py-4 text-sm font-medium transition-all relative",
              activeTab === "schools"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 rotate-90" />
              Filter by School
            </div>
            {activeTab === "schools" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        </div>
        <div className="p-6 flex flex-wrap items-end gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              From
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-11 w-full sm:w-48 px-4 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              To
            </label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-11 w-full sm:w-48 px-4 pl-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
          <Button className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-100">
            Apply
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SETTLEMENT_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all group-hover:scale-110",
                  stat.iconBg,
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              {idx === 4 && (
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg cursor-pointer">
                  <Calendar className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stat.title}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {stat.value}
              </h2>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Order Records Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Order Records</h2>
          <p className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            {orders.length} orders found
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 rounded border border-slate-300 flex items-center justify-center bg-white">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full opacity-0" />
                      </div>
                      ORDER NO.
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    SCHOOL
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    PRODUCT
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    PRODUCT CODE
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    AMOUNT
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    PAYMENT STATUS
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    SETTLE DATE
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    INVOICE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => {
                    const status = order.status || "initialized";
                    const customerName =
                      order.shippingAddress?.recipientName ||
                      order.contactEmail ||
                      "Customer";
                    const amount = Number(order.totalAmount || 0);
                    const createdAt = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    // Deriving standard fields fallback or actual if mapped
                    const schoolName =
                      order.metadata?.schoolName || "Standard Retailer";
                    const productSummary =
                      order.items?.[0]?.productSnapshot?.name ||
                      "Multiple Items";
                    const productCode =
                      order.items?.[0]?.productSnapshot?.sku || "N/A";

                    return (
                      <tr
                        key={order.id || idx}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono text-sm font-bold text-blue-600">
                            <div className="h-4 w-4 rounded border border-slate-300 group-hover:border-blue-400 transition-colors bg-white flex items-center justify-center mr-1" />
                            {shortenOrderId(order.id)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className="text-sm font-bold text-slate-700 max-w-[150px] truncate"
                            title={customerName}
                          >
                            {customerName}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg text-center whitespace-nowrap max-w-[150px] truncate"
                            title={schoolName}
                          >
                            {schoolName}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className="text-sm text-slate-600 max-w-[150px] truncate"
                            title={productSummary}
                          >
                            {productSummary}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-mono text-slate-500 font-medium">
                            {productCode}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-slate-900">
                            ₹{amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-xs text-slate-500 font-medium">
                            {createdAt}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={statusBadgeVariant[status] || "default"}
                            dot
                            className="capitalize text-[11px] font-bold px-3"
                          >
                            {status === "initialized" ? "New" : status}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={
                              paymentStatusVariant[
                                order.paymentStatus || "pending"
                              ] || "warning"
                            }
                            className="capitalize text-[11px] font-bold px-3"
                          >
                            {order.paymentStatus || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="text-xs text-slate-500 font-medium">
                            {order.paymentStatus === "settled"
                              ? createdAt
                              : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={
                              invoiceBadgeVariant[
                                order.invoice || "not_generated"
                              ]
                            }
                            className={cn(
                              "capitalize text-[10px] font-bold px-3 py-1 border rounded-lg",
                              order.invoice === "generated"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-100",
                            )}
                          >
                            {order.invoice === "generated"
                              ? "Generated"
                              : "Not Generated"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
