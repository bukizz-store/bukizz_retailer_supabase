import React, { useState, useEffect, useCallback } from "react";
import {
  Percent,
  Receipt,
  Coins,
  ShieldCheck,
  HelpCircle,
  Calculator,
  RefreshCw,
  Info,
  ArrowRight,
  CheckCircle2,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import financeService from "@/services/financeService";
import useAuthStore from "@/store/authStore";

const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(val) || 0);

export default function CommissionsAndFeesPage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Data states
  const [commissions, setCommissions] = useState([]);
  const [gstSlabs, setGstSlabs] = useState([]);
  const [platformFees, setPlatformFees] = useState([]);
  const [closingFees, setClosingFees] = useState([]);

  // Estimator calculator state
  const [calcInput, setCalcInput] = useState({
    price: 650,
    quantity: 1,
    gstRate: 12,
    isInterState: false,
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [commRes, slabsRes, feesRes, closingRes] = await Promise.all([
        financeService.getMyCommissions().catch(() => ({ data: [] })),
        financeService.getGstSlabs().catch(() => ({ data: [] })),
        financeService.getPlatformFees().catch(() => ({ data: [] })),
        financeService.getClosingFees().catch(() => ({ data: [] })),
      ]);

      if (commRes.success) setCommissions(commRes.data || []);
      if (slabsRes.success) setGstSlabs(slabsRes.data || []);
      if (feesRes.success) setPlatformFees(feesRes.data || []);
      if (closingRes.success) setClosingFees(closingRes.data || []);
    } catch (err) {
      toast.error("Failed to load financial rules");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Run calculation preview
  const runEstimation = useCallback(async () => {
    setSimLoading(true);
    try {
      const payload = {
        items: [
          {
            productId: "00000000-0000-0000-0000-000000000001",
            variantId: "00000000-0000-0000-0000-000000000002",
            quantity: Number(calcInput.quantity) || 1,
            unitPrice: Number(calcInput.price) || 0,
            gstRate: Number(calcInput.gstRate) || 0,
            productType: "general",
          },
        ],
        shippingAddress: {
          state: calcInput.isInterState ? "Karnataka" : "Delhi",
          pincode: "110001",
        },
      };

      const res = await financeService.previewFinancials(payload);
      if (res.success) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  }, [calcInput]);

  useEffect(() => {
    runEstimation();
  }, [runEstimation]);

  // Find default commission percentage
  const defaultRule = commissions.find(
    (c) => !c.product_type && !c.category_id,
  );
  const effectiveBaseCommission = defaultRule
    ? Number(defaultRule.commission_percentage)
    : 5.0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 text-bukizz-orange rounded-xl">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Fees, Commissions &amp; Payout Terms
            </h1>
            <p className="text-sm text-slate-500">
              Clear breakdown of contract commission rates, marketplace
              operating fees, statutory taxes, and settlement estimates.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin text-bukizz-orange" : ""}`}
          />
          Refresh Rules
        </Button>
      </div>

      {/* Contract Commission Rate Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-orange-800">
              Your Marketplace Commission
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-orange-950 mt-1">
              {effectiveBaseCommission.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-900/80">
              Standard contract commission applied to your order line items
              unless category-specific overrides apply.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-500">
              Statutory TCS (Sec 52 CGST)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-900 mt-1">
              1.00%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Deducted on base taxable turnover and deposited to GSTN on your
              GSTIN. Claimable monthly via GSTR-8 portal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-500">
              Marketplace Services GST
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-900 mt-1">
              18.00%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Levied under SAC 9983 on Bukizz platform, closing, and collection
              fees. 100% claimable as Input Tax Credit (ITC).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Rules Table (if custom overrides exist) */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Your Commission Schedule Overrides
            </CardTitle>
            <CardDescription>
              Any category or product-type specific agreements governing your
              vendor catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-semibold text-slate-700">
                      Product Type
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700">
                      Commission Rate
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {rule.product_type || "All Product Types"}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-600">
                        {rule.category_id || "All Categories"}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-orange-600">
                        {Number(rule.commission_percentage).toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Payout Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-bukizz-orange" />
              <CardTitle className="text-base font-bold text-slate-900">
                Net Payout Estimator
              </CardTitle>
            </div>
            <CardDescription>
              Test how selling price, GST bracket, and order type affect your net
              bank settlement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹ Tax-Inclusive)
              </label>
              <Input
                type="number"
                min="1"
                value={calcInput.price}
                onChange={(e) =>
                  setCalcInput({ ...calcInput, price: e.target.value })
                }
                placeholder="e.g. 650"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={calcInput.quantity}
                onChange={(e) =>
                  setCalcInput({ ...calcInput, quantity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicable GST Bracket
              </label>
              <select
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-bukizz-orange"
                value={calcInput.gstRate}
                onChange={(e) =>
                  setCalcInput({
                    ...calcInput,
                    gstRate: Number(e.target.value),
                  })
                }
              >
                <option value={0}>0.00% (Textbooks / Exempt)</option>
                <option value={5}>5.00% (Drawing Books / Print)</option>
                <option value={12}>12.00% (Exercise Notebooks)</option>
                <option value={18}>18.00% (Standard Stationery / Bags)</option>
                <option value={28}>28.00% (Other Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Delivery Destination
              </label>
              <select
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-bukizz-orange"
                value={calcInput.isInterState ? "inter" : "intra"}
                onChange={(e) =>
                  setCalcInput({
                    ...calcInput,
                    isInterState: e.target.value === "inter",
                  })
                }
              >
                <option value="intra">Same State (Intra-State: CGST + SGST)</option>
                <option value="inter">Other State (Inter-State: IGST)</option>
              </select>
            </div>

            <Button
              onClick={runEstimation}
              disabled={simLoading}
              className="w-full mt-2"
            >
              {simLoading ? "Calculating..." : "Recalculate Payout"}
            </Button>
          </CardContent>
        </Card>

        {/* Payout Breakdown Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Estimated Settlement Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed bifurcation of customer payment, tax components, and
                  deductions.
                </CardDescription>
              </div>
              {simResult?.vendorSettlementSummary && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">
                    Net Payout to You:
                  </span>
                  <p className="text-2xl font-black text-green-700">
                    {formatINR(
                      simResult.vendorSettlementSummary.netVendorSettlement,
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {simResult?.vendorSettlementSummary ? (
              <div className="space-y-4">
                {/* 3 Metric Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500">Customer Price:</span>
                    <p className="text-base font-bold text-slate-900">
                      {formatINR(simResult.itemsTotal)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <span className="text-xs text-orange-700">
                      Total Bukizz Deductions:
                    </span>
                    <p className="text-base font-bold text-orange-900">
                      -
                      {formatINR(
                        simResult.vendorSettlementSummary.totalVendorDeductions,
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-xs text-green-700">
                      Payout Realization:
                    </span>
                    <p className="text-base font-bold text-green-900">
                      {Math.round(
                        (simResult.vendorSettlementSummary.netVendorSettlement /
                          (simResult.itemsTotal || 1)) *
                          100,
                      )}
                      % of Selling Price
                    </p>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Base Taxable Selling Value:</span>
                    <span>{formatINR(simResult.totalTaxableBase)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 pl-3">
                    <span>
                      Product Tax Component ({calcInput.gstRate}%):
                    </span>
                    <span>
                      {formatINR(
                        (simResult.totalCgst || 0) +
                          (simResult.totalSgst || 0) +
                          (simResult.totalIgst || 0),
                      )}{" "}
                      <span className="text-slate-400 text-xs">
                        ({calcInput.isInterState ? "IGST" : "CGST + SGST"})
                      </span>
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 font-semibold text-slate-700">
                    Deductions &amp; Statutory Remittances:
                  </div>

                  <div className="flex justify-between text-red-600 pl-3">
                    <span>
                      Bukizz Commission ({effectiveBaseCommission}%):
                    </span>
                    <span>
                      -
                      {formatINR(
                        simResult.vendorSettlementSummary.totalCommission,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-red-600 pl-3">
                    <span>Tiered Order Closing Fee:</span>
                    <span>
                      -
                      {formatINR(
                        simResult.vendorSettlementSummary.totalClosingFee,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-red-600 pl-3">
                    <span>Vendor Platform &amp; Gateway Fees:</span>
                    <span>
                      -
                      {formatINR(
                        (simResult.vendorSettlementSummary.platformFeeBase ||
                          0) +
                          (simResult.vendorSettlementSummary
                            .collectionFeeBase || 0),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-red-600 pl-3">
                    <span>18% GST on Bukizz Service Fees:</span>
                    <span>
                      -
                      {formatINR(
                        simResult.vendorSettlementSummary.totalGstOnFees,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-red-600 pl-3">
                    <span>Statutory 1% TCS (Sec 52 CGST Act):</span>
                    <span>
                      -
                      {formatINR(simResult.vendorSettlementSummary.totalTcs)}
                    </span>
                  </div>

                  <div className="border-t-2 border-slate-300 pt-3 flex justify-between font-bold text-base">
                    <span className="text-slate-900">
                      Net Amount Deposited to Bank:
                    </span>
                    <span className="text-green-700">
                      {formatINR(
                        simResult.vendorSettlementSummary.netVendorSettlement,
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                  <p>
                    <strong>Input Tax Credit Reminder:</strong> All GST charged
                    on marketplace fees (
                    {formatINR(
                      simResult.vendorSettlementSummary.totalGstOnFees,
                    )}
                    ) will appear on your monthly GST invoice from Bukizz,
                    enabling 100% tax offset against your output GST liability.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-bukizz-orange" />
                Calculating payout preview...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tiered Closing Fee Table & Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-bukizz-orange" />
              <CardTitle className="text-base font-bold text-slate-900">
                Tiered Closing Fee Matrix
              </CardTitle>
            </div>
            <CardDescription>
              Automatic item-level closing charge resolved per unit selling price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">
                      Price Bracket (₹)
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">
                      Closing Charge
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">
                      GST (18%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {closingFees.map((slab) => {
                    const min = Number(slab.min_price ?? slab.minPrice ?? 0);
                    const max =
                      slab.max_price ?? slab.maxPrice
                        ? Number(slab.max_price ?? slab.maxPrice)
                        : null;
                    const fee = Number(slab.fee_amount ?? slab.feeAmount ?? 0);

                    return (
                      <tr key={slab.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {max !== null
                            ? `${formatINR(min)} - ${formatINR(max)}`
                            : `Above ${formatINR(min)}`}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-orange-600">
                          {formatINR(fee)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          +{formatINR(fee * 0.18)}
                        </td>
                      </tr>
                    );
                  })}
                  {closingFees.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">
                        Loading closing fee slabs...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-bukizz-orange" />
              <CardTitle className="text-base font-bold text-slate-900">
                Tax &amp; Regulatory Compliance
              </CardTitle>
            </div>
            <CardDescription>
              Legal guidelines governing settlements and e-commerce vendor taxation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p>
                <strong>No Double Taxation on Bundles:</strong> When multi-item
                bundles (such as school kit book sets) are sold, taxes are
                computed individually on each component to prevent mixed-supply
                tax escalation.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p>
                <strong>TCS Remittance to GSTN:</strong> Under Section 52 of
                the CGST Act, Bukizz deposits 1% TCS on your behalf against your
                registered GSTIN every month. You can accept these credits on
                the GST portal (Form GSTR-8).
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p>
                <strong>GST Invoices for Fees:</strong> Bukizz generates
                compliant B2B tax invoices for all platform, collection, and
                closing charges, allowing full Input Tax Credit (ITC) recovery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
