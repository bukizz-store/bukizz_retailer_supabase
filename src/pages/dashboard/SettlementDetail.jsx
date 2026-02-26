import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Wallet,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  X,
  Printer,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { settlementService } from "@/services/settlementService";
import { cn } from "@/lib/utils";

export default function SettlementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeductionsExpanded, setIsDeductionsExpanded] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await settlementService.getSettlementDetail(id);
      setData(response?.data || response);
    } catch (error) {
      console.error("Error fetching settlement detail:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shortenId = (fullId) => {
    if (!fullId) return "";
    return `#${fullId.replace(/-/g, "").slice(-8).toUpperCase()}`;
  };

  // No need to calculate breakdown manually anymore since API provides 'breakup' object
  // But we'll keep the function signature empty or remove it.

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-500 font-medium tracking-wide">
          Loading settlement details...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium text-slate-700">
          Settlement not found
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const settlement = data.settlement || {};
  const breakup = data.breakup || { grossSales: 0, platformFees: 0 };
  const ledgers = data.ledgers || [];

  const totalAmount = Number(settlement.total_amount || 0);
  const totalDeductions =
    Number(breakup.platformFees || 0) +
    Number(breakup.returns || 0) +
    Number(breakup.manualAdjustments || 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* ── Breadcrumbs & Back ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <nav className="flex text-sm text-slate-500">
            <span
              className="hover:text-blue-600 cursor-pointer"
              onClick={() => navigate("/dashboard/settlements")}
            >
              Settlements
            </span>
            <span className="mx-2">›</span>
            <span className="text-slate-900 font-medium truncate max-w-[150px]">
              {shortenId(settlement.id)}
            </span>
          </nav>
        </div>
        {settlement.receipt_url && (
          <Button
            variant="outline"
            className="h-9 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setIsReceiptModalOpen(true)}
          >
            <FileText className="h-4 w-4 mr-2" /> View Bank Receipt
          </Button>
        )}
      </div>

      {/* ── Main Header Card (Razorpay Style) ── */}
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Settlement ID:{" "}
                <span className="text-slate-600 font-mono tracking-normal">
                  {settlement.id}
                </span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  ₹{totalAmount.toLocaleString()}
                </span>
                <Badge
                  variant="success"
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                  {settlement.status || "COMPLETED"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                Initiated on{" "}
                <span className="text-slate-700">
                  {formatDateStr(settlement.created_at)}
                </span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm min-w-[280px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Bank Reference
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {settlement.reference_number || "—"}
                  </div>
                  <div className="text-xs text-slate-500">UTR Number</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Amount Breakup & Details ── */}
      <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">
        Amount Breakup
      </h2>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="font-semibold text-slate-700">Gross Sales</div>
              </div>
              <div className="font-bold text-slate-900">
                ₹{Number(breakup.grossSales || 0).toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col">
              <div
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setIsDeductionsExpanded(!isDeductionsExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div className="font-semibold text-slate-700">
                    Deductions & Fees
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-red-500">
                    -₹{totalDeductions.toLocaleString()}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-slate-400 transition-transform duration-300",
                      isDeductionsExpanded && "rotate-180",
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out bg-slate-50 border-t border-slate-100/50",
                  isDeductionsExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col divide-y divide-slate-100/50 px-5 pb-2">
                    <div className="flex items-center justify-between py-3 pl-12 pr-10 hover:bg-slate-100/50 transition-colors rounded-lg mb-1 mt-2">
                      <div className="text-sm font-medium text-slate-600">
                        Platform Fees & Deductions
                      </div>
                      <div className="text-sm font-semibold text-red-500">
                        {Number(breakup.platformFees || 0) > 0
                          ? `-₹${Number(breakup.platformFees || 0).toLocaleString()}`
                          : "₹0"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 pl-12 pr-10 hover:bg-slate-100/50 transition-colors rounded-lg mb-1">
                      <div className="text-sm font-medium text-slate-600">
                        Returns
                      </div>
                      <div className="text-sm font-semibold text-red-500">
                        {Number(breakup.returns || 0) > 0
                          ? `-₹${Number(breakup.returns || 0).toLocaleString()}`
                          : "₹0"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 pl-12 pr-10 hover:bg-slate-100/50 transition-colors rounded-lg mb-1">
                      <div className="text-sm font-medium text-slate-600">
                        Manual Adjustments/Fees
                      </div>
                      <div className="text-sm font-semibold text-red-500">
                        {Number(breakup.manualAdjustments || 0) > 0
                          ? `-₹${Number(breakup.manualAdjustments || 0).toLocaleString()}`
                          : "₹0"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50/50">
              <div className="font-bold text-slate-900 text-lg">
                Net Amount Settled
              </div>
              <div className="font-extrabold text-slate-900 text-xl">
                ₹{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Transactions Table ── */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Transactions in this Settlement
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!ledgers || ledgers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  ledgers.map((ledger, idx) => {
                    const isDebit =
                      ledger.entry_type === "DEBIT" ||
                      ledger.transaction_type === "PLATFORM_FEE";
                    const amount = Number(
                      ledger.amount_applied_in_this_settlement ||
                      ledger.amount ||
                      0,
                    );
                    const date = ledger.orders?.created_at
                      ? formatDateStr(ledger.orders.created_at)
                      : formatDateStr(ledger.created_at);
                    const orderIdStr =
                      ledger.order_items?.dispatch_id ||
                      shortenId(ledger.orders?.order_number || ledger.id);
                    const productName =
                      (ledger.order_items?.title || "Transaction") +
                      (isDebit ? " (Fee)" : "");
                    const studentName =
                      ledger.orders?.shipping_address?.studentName ||
                      "—";
                    const qty = ledger.order_items?.quantity || "—";
                    const status = ledger.order_items?.status || "—";

                    const statusLabelMap = {
                      initialized: "New",
                      processed: "Processed",
                      shipped: "Shipped",
                      out_for_delivery: "Out for Delivery",
                      delivered: "Delivered",
                      cancelled: "Cancelled",
                      refunded: "Refunded",
                    };

                    const statusBadgeMap = {
                      initialized: "initialized",
                      processed: "processing",
                      shipped: "shipped",
                      out_for_delivery: "out_for_delivery",
                      delivered: "delivered",
                      cancelled: "cancelled",
                      refunded: "refunded",
                    };

                    const badgeVariant = statusBadgeMap[status] || "default";
                    const displayStatus = statusLabelMap[status] || status;

                    return (
                      <tr
                        key={ledger.id || idx}
                        className={cn(
                          "hover:bg-slate-50/50 transition-colors",
                          ledger.order_items?.id && "cursor-pointer",
                        )}
                        onClick={() => {
                          if (ledger.order_items?.id) {
                            navigate(
                              `/dashboard/orders/${ledger.order_items.id}`,
                            );
                          }
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {date}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                          {orderIdStr}
                        </td>
                        <td
                          className="px-6 py-4 text-sm text-slate-600 max-w-[250px] truncate"
                          title={productName}
                        >
                          {productName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 truncate max-w-[180px]">
                          {studentName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={cn(
                              "text-sm font-bold",
                              isDebit ? "text-red-500" : "text-slate-900",
                            )}
                          >
                            {isDebit ? "-" : ""}₹{amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-slate-900">
                            {qty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {status !== "—" ? (
                            <Badge variant={badgeVariant} dot>
                              {displayStatus}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
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

      {/* Receipt Modal Overlay */}
      {isReceiptModalOpen && settlement?.receipt_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Bank Receipt
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 bg-white"
                  onClick={() => {
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = settlement.receipt_url;
                    document.body.appendChild(iframe);

                    iframe.onload = () => {
                      try {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                      } catch (e) {
                        window.open(settlement.receipt_url, '_blank');
                      }
                      setTimeout(() => document.body.removeChild(iframe), 2000);
                    };
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:border-blue-200 bg-blue-50/50"
                  onClick={() => window.open(settlement.receipt_url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800 bg-slate-100/50 hover:bg-slate-100 rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100/80 p-4 overflow-auto flex items-center justify-center relative">
              {/\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(settlement.receipt_url) ? (
                <img
                  src={settlement.receipt_url}
                  alt="Bank Receipt"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={settlement.receipt_url}
                  className="w-full h-full min-h-[70vh] rounded-lg shadow-sm bg-white border border-slate-200"
                  title="Bank Receipt"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
