import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { settlementService } from "@/services/settlementService";

// Dummy Data (Partial)

const statusBadgeVariant = {
  delivered: "delivered",
  processing: "processing",
  shipped: "shipped",
  returned: "refunded", // Using refunded variant for returned for distinct color
  cancelled: "cancelled",
};

const paymentStatusVariant = {
  SETTLED: "delivered",
  PENDING: "warning",
  ON_HOLD: "warning",
  AVAILABLE: "info",
};

const invoiceBadgeVariant = {
  generated: "delivered",
  not_generated: "default",
};

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState("dates");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [summaryData, setSummaryData] = useState({});
  const [ledgersData, setLedgersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { activeWarehouse } = useWarehouse();

  const fetchSettlementData = useCallback(async () => {
    if (!activeWarehouse?.id) return;
    setIsLoading(true);
    try {
      const params = {
        warehouseId: activeWarehouse.id,
      };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      const [summaryRes, ledgersRes] = await Promise.all([
        settlementService.getSettlementSummary(params),
        settlementService.getSettlementLedgers({
          ...params,
          page: 1,
          limit: 1000,
        }),
      ]);

      const sumData = summaryRes?.data;
      console.log(sumData)
      setSummaryData( sumData || {});

      let lData = ledgersRes?.data;
      if (lData && !Array.isArray(lData)) {
        lData =
          lData.data ||
          lData.records ||
          lData.ledgers ||
          Object.values(lData).find(Array.isArray) ||
          [];
      }
      setLedgersData(
        Array.isArray(lData)
          ? lData
          : Array.isArray(ledgersRes)
            ? ledgersRes
            : [],
      );
    } catch (error) {
      console.error("Error fetching settlement data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeWarehouse?.id, fromDate, toDate]);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

  // Compute stats

  // Format amount compactly (e.g., 58000 -> 58.0K)
  const formatAmountK = (num) => {
    if (!num) return "₹0";
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num.toLocaleString()}`;
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const SETTLEMENT_STATS = [
    {
      title: "Total Orders",
      value: (summaryData.total_orders || 0).toString(),
      subtext: "Excl. cancelled",
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: formatAmountK(summaryData.total_sales),
      subtext: "Delivered & Processing",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "To Be Settled",
      value: !summaryData.toBeSettled
        ? "NA"
        : formatAmountK(summaryData.to_be_settled),
      subtext: "Incl. return deductions",
      icon: Wallet,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Last Settlement",
      value: formatDateStr(summaryData.last_settlement_date),
      subtext: "Most recent payout",
      icon: Clock,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Next Settlement",
      value: formatDateStr(summaryData.next_settlement_date),
      subtext: summaryData.nextSettlement?.amount
        ? `(₹${(summaryData.nextSettlement.amount / 1000).toFixed(1)}K) Adjusted for returns`
        : "Adjusted for returns",
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
          <Button
            onClick={fetchSettlementData}
            className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-100"
          >
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
            {ledgersData.length} records found
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
                      DISPATCH ID
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
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
                      Loading ledgers...
                    </td>
                  </tr>
                ) : ledgersData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  ledgersData.map((ledger, idx) => {
                    const status = ledger.order_items?.status || "—";
                    const paymentStatus = ledger.status || "PENDING";
                    const customerName =
                      ledger.orders?.shippingAddress?.recipientName ||
                      ledger.orders?.contactEmail ||
                      "Customer";
                    const amount = Number(ledger.amount || 0);
                    const createdAt = ledger.orders?.created_at
                      ? new Date(ledger.orders.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—";

                    let settleDate = "—";
                    if (paymentStatus === "PENDING" && ledger.trigger_date) {
                      settleDate = new Date(
                        ledger.trigger_date,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    } else if (
                      paymentStatus === "SETTLED" &&
                      ledger.updated_at
                    ) {
                      settleDate = new Date(
                        ledger.updated_at,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    }

                    // Deriving standard fields fallback or actual if mapped
                    const schoolName =
                      ledger.orders?.metadata?.schoolName ||
                      "Standard Retailer";
                    const productSummary =
                      (ledger.order_items?.title || "Multiple Items") +
                      (ledger.transaction_type === "PLATFORM_FEE"
                        ? " (Platform Fee)"
                        : "");
                    const productCode = ledger.order_items?.sku || "N/A";

                    return (
                      <tr
                        key={ledger.id || idx}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono text-sm font-bold text-blue-600">
                            <div className="h-4 w-4 rounded border border-slate-300 group-hover:border-blue-400 transition-colors bg-white flex items-center justify-center mr-1" />
                            {ledger.order_items?.dispatch_id ||
                              shortenOrderId(
                                ledger.orders?.order_number || ledger.id,
                              )}
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
                          <div
                            className={cn(
                              "text-sm font-bold",
                              ledger.entry_type === "DEBIT"
                                ? "text-red-500"
                                : "text-slate-900",
                            )}
                          >
                            {ledger.entry_type === "DEBIT" ? "-" : ""}₹
                            {amount.toLocaleString()}
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
                              paymentStatusVariant[paymentStatus] || "default"
                            }
                            className={cn(
                              "capitalize text-[11px] font-bold px-3",
                              paymentStatus === "AVAILABLE" &&
                                "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 shadow-sm",
                            )}
                          >
                            {paymentStatus === "ON_HOLD"
                              ? "Pending"
                              : paymentStatus === "AVAILABLE"
                                ? "Ready"
                                : paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            {settleDate}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={
                              invoiceBadgeVariant[
                                ledger.invoice || "not_generated"
                              ]
                            }
                            className={cn(
                              "capitalize text-[10px] font-bold px-3 py-1 border rounded-lg",
                              ledger.invoice === "generated"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-100",
                            )}
                          >
                            {ledger.invoice === "generated"
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
