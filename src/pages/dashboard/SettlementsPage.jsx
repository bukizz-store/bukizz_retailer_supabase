import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useWarehouse } from "@/context/WarehouseContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  Calendar,
  Wallet,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";

// ─── Info Tooltip (Portal-based, escapes overflow containers) ───────────────
function InfoTooltip({ text }) {
  const iconRef = useRef(null);
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setShow(true);
  };

  return (
    <span className="inline-flex items-center ml-1.5" style={{ verticalAlign: 'middle' }}>
      <span
        ref={iconRef}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        className="inline-flex cursor-default"
      >
        <Info className="h-3.5 w-3.5 text-slate-400 hover:text-blue-500 transition-colors" />
      </span>
      {show &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
            className="fixed z-[9999] pointer-events-none"
          >
            <div className="w-56 rounded-xl bg-slate-800 text-white text-xs leading-relaxed px-3 py-2 shadow-xl text-center">
              {text}
            </div>
            {/* Arrow pointing down */}
            <div className="flex justify-center -mt-[1px]">
              <span className="border-4 border-transparent border-t-slate-800" />
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}
import { cn } from "@/lib/utils";
import { settlementService } from "@/services/settlementService";
import { useNavigate } from "react-router-dom";

// Helpers & Constants
const statusBadgeVariant = {
  delivered: "delivered",
  processing: "processing",
  shipped: "shipped",
  returned: "refunded",
  cancelled: "cancelled",
};

const paymentStatusVariant = {
  SETTLED: "delivered",
  PENDING: "warning",
  ON_HOLD: "warning",
  AVAILABLE: "info",
};

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

const shortenOrderId = (id) => {
  if (!id) return "";
  if (id.length <= 12) return id;
  const short = id.replace(/-/g, "").slice(-8).toUpperCase();
  return `#${short}`;
};

export default function SettlementsPage() {
  const navigate = useNavigate();
  const { activeWarehouse } = useWarehouse();

  // Tab State
  const [activeTab, setActiveTab] = useState("all_settlements"); // all_ledgers, current_cycle, all_settlements

  // Filter State (for Ledgers)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data State
  const [summaryData, setSummaryData] = useState({});
  const [ledgersData, setLedgersData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State for Ledgers
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Pagination State for History
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // ─── Fetch Summary ───
  const fetchSummary = useCallback(async () => {
    if (!activeWarehouse?.id) return;
    try {
      const params = { warehouseId: activeWarehouse.id };
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      const response = await settlementService.getSettlementSummary(params);
      setSummaryData(response?.data || {});
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, [activeWarehouse?.id, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ─── Fetch Tab Data ───
  const fetchTabData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "all_ledgers") {
        if (!activeWarehouse?.id) return;
        const params = { warehouseId: activeWarehouse.id, page, limit };
        if (fromDate) params.startDate = fromDate;
        if (toDate) params.endDate = toDate;
        const response = await settlementService.getRetailerLedgers(params);
        setLedgersData(
          response?.data?.data ||
          response?.data?.entries ||
          response?.data ||
          [],
        );
        if (response?.data?.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
      } else if (activeTab === "current_cycle") {
        if (!activeWarehouse?.id) return;
        const params = {
          warehouseId: activeWarehouse.id,
          page,
          limit,
          status: "unsettled",
        };
        if (fromDate) params.startDate = fromDate;
        if (toDate) params.endDate = toDate;
        const response = await settlementService.getRetailerLedgers(params);
        setLedgersData(
          response?.data?.data ||
          response?.data?.entries ||
          response?.data ||
          [],
        );
        if (response?.data?.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
      } else if (activeTab === "all_settlements") {
        // No warehouse ID attached for Payouts
        const params = { page: historyPage, limit };
        if (fromDate) params.startDate = fromDate;
        if (toDate) params.endDate = toDate;
        const response = await settlementService.getRetailerHistory(params);
        setHistoryData(
          response?.data?.data ||
          response?.data?.records ||
          response?.data ||
          [],
        );
        if (response?.data?.pagination) {
          setHistoryTotalPages(response.data.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching tab data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeWarehouse?.id, page, historyPage, fromDate, toDate]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  // Resets
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setHistoryPage(1);
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
      title: "Last Settlement",
      value: formatDateStr(summaryData.last_settlement_date),
      subtext: "Most recent payout",
      icon: Clock,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Today's Settled",
      value: !summaryData.to_be_settled
        ? "NA"
        : formatAmountK(summaryData.to_be_settled),
      subtext: "Incl. return deductions",
      icon: Wallet,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Next Settlement",
      value: formatDateStr(summaryData.next_settlement_date),
      subtext: summaryData.next_settlement_amount
        ? `(₹${(summaryData.next_settlement_amount / 1000).toFixed(1)}K) Adjusted for returns`
        : "Adjusted for returns",
      icon: Calendar,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  // ─── Render Functions ───
  const renderLedgersTable = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                DISPATCH ID / ORDER NO.
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Product Code
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Settlement Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
                  Loading ledgers...
                </td>
              </tr>
            ) : ledgersData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              ledgersData.map((ledger, idx) => {
                const status = ledger.order_items?.status || "—";
                const paymentStatus = ledger.status || "PENDING";
                const amount = Number(ledger.amount || 0);
                const createdAt = ledger.orders?.created_at
                  ? formatDateStr(ledger.orders.created_at)
                  : "—";

                // Formats
                const productSummary =
                  (ledger.order_items?.title || "Multiple Items") +
                  (ledger.transaction_type === "PLATFORM_FEE"
                    ? " (Platform Fee)"
                    : "");
                const productCode = ledger.order_items?.sku || "N/A";
                const orderIdStr =
                  ledger.order_items?.dispatch_id ||
                  shortenOrderId(ledger.orders?.order_number || ledger.id);
                const isDebit = ledger.entry_type === "DEBIT";

                return (
                  <tr
                    key={ledger.id || idx}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {createdAt}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold text-blue-600">
                        {orderIdStr}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className="text-sm text-slate-600 max-w-[200px] truncate"
                        title={productSummary}
                      >
                        {productSummary}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-mono text-slate-500 font-medium">
                      {productCode}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div
                        className={cn(
                          "text-sm font-bold",
                          isDebit ? "text-red-500" : "text-slate-900",
                        )}
                      >
                        {isDebit ? "-" : ""}₹{amount.toLocaleString()}
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && ledgersData.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderHistoryTable = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Settlement Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Settlement ID
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                UTR / Reference
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Net Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto mb-2" />
                  Loading history...
                </td>
              </tr>
            ) : historyData.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No past settlements found.
                </td>
              </tr>
            ) : (
              historyData.map((settlement, idx) => {
                const amount = Number(settlement.total_amount || 0);
                const createdAt = settlement.created_at
                  ? formatDateStr(settlement.created_at)
                  : "—";

                return (
                  <tr
                    key={settlement.id || idx}
                    onClick={() =>
                      navigate(`/dashboard/settlements/${settlement.id}`)
                    }
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {createdAt}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap font-mono text-sm font-bold text-blue-600">
                      {shortenOrderId(settlement.id)}
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                      {settlement.reference_number || "—"}
                    </td>
                    <td className="px-6 py-5 text-right font-extrabold text-slate-900">
                      ₹{amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge
                        variant="success"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> COMPLETED
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {!isLoading && historyData.length > 0 && historyTotalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Page {historyPage} of {historyTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                }
                disabled={historyPage === historyTotalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* ── Breadcrumbs ── */}
      <nav className="flex text-sm text-slate-500 mb-2">
        <span className="hover:text-blue-600 cursor-pointer">Home</span>
        <span className="mx-2">›</span>
        <span className="text-slate-900 font-medium">Settlements</span>
      </nav>

      {/* ── Header ── */}
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
              Review ledgers, track your current cycle, and access payout
              history.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* ── Stats Grid ── */}
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

      {/* ── Filter Controls ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-10 w-full sm:w-48 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            To Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-10 w-full sm:w-48 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setPage(1);
            setHistoryPage(1);
            fetchTabData();
            fetchSummary();
          }}
          className="h-10 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100"
        >
          Apply Filters
        </Button>
      </div>

      {/* ── 3-Tab UI ── */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange("all_settlements")}
            className={cn(
              "inline-flex items-center px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2",
              activeTab === "all_settlements"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            All Settlements (Payouts)
            <InfoTooltip text="Shows all completed payout batches transferred to your bank account, along with their UTR/reference numbers and settlement dates." />
          </button>
          <button
            onClick={() => handleTabChange("current_cycle")}
            className={cn(
              "inline-flex items-center px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2",
              activeTab === "current_cycle"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            Current Cycle (Unsettled)
            <InfoTooltip text="Displays orders from the ongoing settlement cycle that are delivered but not yet paid out. These amounts will be included in your next scheduled bank transfer." />
          </button>
          <button
            onClick={() => handleTabChange("all_ledgers")}
            className={cn(
              "inline-flex items-center px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2",
              activeTab === "all_ledgers"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            All Ledgers
            <InfoTooltip text="A complete transaction-level history of every debit and credit — including delivered orders, returns, platform fees, and adjustments — across all time." />
          </button>
        </div>

        <div className="pt-2">
          {activeTab === "all_ledgers" || activeTab === "current_cycle"
            ? renderLedgersTable()
            : renderHistoryTable()}
        </div>
      </div>
    </div>
  );
}
