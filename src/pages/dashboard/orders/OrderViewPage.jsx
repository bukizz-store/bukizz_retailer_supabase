import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { useWarehouse } from "@/context/WarehouseContext";
import useAuthStore from "@/store/authStore";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Printer,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Calendar,
  Clock,
  Truck,
  ShoppingBag,
  GraduationCap,
  Hash,
  IndianRupee,
  FileText,
  Box,
  RefreshCw,
} from "lucide-react";

// ── Status helpers (same as ActiveOrdersPage) ──────────────────────────────────
const statusLabelMap = {
  initialized: "New",
  processed: "Processed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusBadgeVariant = {
  initialized: "initialized",
  processed: "processing",
  shipped: "shipped",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded",
};

const paymentStatusVariant = {
  pending: "pending",
  paid: "success",
  failed: "rejected",
  refunded: "refunded",
};

const statusFlow = [
  "initialized",
  "processed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

/**
 * Derive the effective order status from the items array.
 * The status lives at `order.items[].status`, not `order.status`.
 * Uses the least-progressed item status as the bottleneck.
 */
const STATUS_PRIORITY = [
  "initialized",
  "processed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

function getOrderStatus(order) {
  const items = order.items || [];
  if (items.length === 0) return order.status || "initialized";
  let minIndex = STATUS_PRIORITY.length;
  for (const item of items) {
    const idx = STATUS_PRIORITY.indexOf(item.status);
    if (idx !== -1 && idx < minIndex) minIndex = idx;
  }
  return minIndex < STATUS_PRIORITY.length
    ? STATUS_PRIORITY[minIndex]
    : order.status || "initialized";
}

function shortenOrderId(order) {
  if (order.orderNumber) return order.orderNumber;
  const id = order.id || "";
  if (id.length <= 12) return id;
  const short = id.replace(/-/g, "").slice(-8).toUpperCase();
  return `#${short}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OrderViewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { activeWarehouse } = useWarehouse();
  const { user: authUser } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch order ──
  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderItemsById(orderId);
      const responseData = response?.data || response;

      let parsedOrder = responseData;

      // Handle the new separated format: order_item_data and order_data
      if (responseData.order_data && responseData.order_item_data) {
        const itemData = responseData.order_item_data;
        const orderData = responseData.order_data;
        parsedOrder = {
          ...orderData,
          items: [itemData],
          totalAmount: itemData.totalPrice || orderData.totalAmount,
          createdAt:
            orderData.createdAt ||
            itemData.createdAt ||
            new Date().toISOString(),
          updatedAt:
            orderData.updatedAt ||
            itemData.updatedAt ||
            new Date().toISOString(),
          warehouseId: itemData.warehouseId || orderData.warehouseId,
          metadata: orderData.metadata || {},
        };
      }

      setOrder(parsedOrder);

      // Fetch user details if userId exists
      if (parsedOrder?.userId) {
        setIsUserLoading(true);
        try {
          const userResponse = await orderService.getUserById(
            parsedOrder.userId,
          );
          const userData = userResponse?.data || userResponse;
          setUser(userData?.user || userData);
        } catch {
          // User fetch is non-critical — we still have order contact info
          setUser(null);
        }
        setIsUserLoading(false);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load order details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ── Confirm order ──
  const handleUpdateStatus = async () => {
    const currentStatus = getOrderStatus(order);
    if (!order || !["initialized", "processed"].includes(currentStatus)) return;

    const nextStatus =
      currentStatus === "initialized" ? "processed" : "shipped";
    const note =
      currentStatus === "initialized"
        ? "Confirmed by retailer"
        : "Shipped by retailer";

    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(order.id, {
        status: nextStatus,
        note: note,
      });
      setOrder((prev) => ({
        ...prev,
        status: nextStatus,
        items: (prev.items || []).map((item) => ({
          ...item,
          status: nextStatus,
        })),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Print label ──
  const handlePrintLabel = () => {
    if (!order) return;
    const address = order.shippingAddress || {};
    const addressLines = [
      `Student: ${address.studentName || "—"}`,
      " ",
      address.recipientName || order.contactEmail || "Customer",
      address.line1,
      address.line2,
      `${address.city || ""}${address.city && address.state ? ", " : ""}${address.state || ""} ${address.postalCode || ""}`.trim(),
      order.contactPhone ? `Phone: ${order.contactPhone}` : "",
    ]
      .filter(Boolean)
      .join("<br/>");

    const retailerName =
      authUser?.fullName || authUser?.name || "Retailer Name";
    const warehouseName = activeWarehouse?.name || "Warehouse Name";
    const qrData = `${order.items?.[0]?.id || ""} , ${order.id}`;

    const labelContent = `
            <html><head><title>Label — ${shortenOrderId(order)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; display: flex; justify-content: center; }
                .label-box { border: 2px solid #000; width: 100%; max-width: 550px; }
                .header-row { display: flex; border-bottom: 2px solid #000; }
                .header-left { flex: 1; padding: 16px; border-right: 2px solid #000; }
                .header-right { flex: 1; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .logo-row { display: flex; align-items: center; gap: 8px; margin: 12px 0; }
                .body-section { padding: 16px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { border: 1px solid #000; padding: 10px; text-align: left; }
                th { background-color: #f9f9f9; text-align: center; }
                .text-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
            </style></head><body>
            <div class="label-box">
                <div class="header-row">
                    <div class="header-left">
                        <div class="text-bold">Delivered By:</div>
                        <div class="logo-row">
                            <img src="${window.location.origin}/logo.svg" alt="bukizz" style="height: 32px;" onerror="this.style.display='none'" />
                        </div>
                        <div class="text-bold mb-1">Fulfilled By:</div>
                        <div>${retailerName} ,<br/>${warehouseName}</div>
                    </div>
                    <div class="header-right">
                        <div class="mb-2">QR</div>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" alt="QR Code" style="width: 120px; height: 120px; margin-bottom: 8px;"/>
                    </div>
                </div>
                <div class="body-section">
                    <div class="text-bold mb-1">Shipping Address:</div>
                    <div class="mb-4">${addressLines}<br/></div>
                    
                    <div class="text-bold mb-3">Order Number: ${shortenOrderId(order)}</div>
                    
                    <div class="text-bold mb-4">Delivery Date: ${order.deliveryDate || "N/A"}</div>
                    
                    <div class="text-bold mb-2">Details:</div>
                    <table class="mb-4">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items
        ?.map(
          (item) => `
                            <tr>
                                <td>${item.title || item.productSnapshot?.name} - ${item.schoolName || ""}</td>
                                <td style="text-align: center;">${order.totalAmount || item.totalPrice || item.unitPrice * (item.quantity || 1)}</td>
                                <td style="text-align: center;">Prepaid</td>
                            </tr>
                            `,
        )
        .join("") || ""
      }
                        </tbody>
                    </table>
                    
                    <div class="mb-2" style="margin-top: 32px;">
                        Payment Due on Receipt: ${order.paymentMethod === "cod" ? "COD" : "Prepaid"}
                    </div>
                </div>
            </div>
            </body></html>`;
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (printWindow) {
      printWindow.document.write(labelContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-slate-500">Loading order details…</span>
      </div>
    );
  }

  // ── Error state ──
  if (error && !order) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-lg font-medium text-slate-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={fetchOrder}
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = getOrderStatus(order);
  const shippingAddr = order.shippingAddress || {};
  const billingAddr = order.billingAddress || {};
  const summary = order.metadata?.orderSummary || {};
  const items = order.items || [];
  const currentStepIndex = statusFlow.indexOf(status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Top bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {items[0]?.dispatchId || shortenOrderId(order)}
              </h1>
              <Badge variant={statusBadgeVariant[status] || "default"} dot>
                {statusLabelMap[status] || status}
              </Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                Order ID: <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{order.id}</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span>Placed on {formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handlePrintLabel}>
            <Printer className="h-4 w-4" /> Print Label
          </Button>
          {["initialized", "processed"].includes(status) && (
            <Button
              variant="success"
              size="sm"
              onClick={handleUpdateStatus}
              loading={isUpdating}
            >
              {status === "processed" ? (
                <>
                  <Truck className="h-4 w-4" /> Ship Order
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Confirm Order
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* ── Status Timeline ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {statusFlow.map((step, i) => {
              const isCompleted = currentStepIndex >= i;
              const isCurrent = currentStepIndex === i;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-400",
                        isCurrent && "ring-4 ring-emerald-100",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium text-center",
                        isCompleted ? "text-emerald-700" : "text-slate-400",
                      )}
                    >
                      {statusLabelMap[step]}
                    </span>
                  </div>
                  {i < statusFlow.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        currentStepIndex > i
                          ? "bg-emerald-500"
                          : "bg-slate-200",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {["cancelled", "refunded"].includes(status) && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                This order has been {status}.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Main grid: Order info + Customer ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Order Items ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const snapshot = item.productSnapshot || {};
                  // Prefer variant-specific image (e.g. color swatch) over generic product image
                  const variantImage = item.variant?.options?.find(
                    (o) => o.imageUrl,
                  )?.imageUrl;
                  const imageUrl =
                    variantImage || snapshot.image || snapshot.image_url;
                  const isBookset = snapshot.productType === "bookset";
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {/* Product image */}
                      <div
                        className={cn(
                          "h-16 w-16 shrink-0 rounded-lg flex items-center justify-center overflow-hidden",
                          imageUrl
                            ? "bg-slate-50"
                            : isBookset
                              ? "bg-violet-50"
                              : "bg-slate-100",
                        )}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : isBookset ? (
                          <GraduationCap className="h-7 w-7 text-violet-500" />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-slate-400" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.title || snapshot.title || "Product"}
                        </p>

                        {/* Variant options (e.g. Color: Red, Size: M) */}
                        {item.variant?.options?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.variant.options
                              .sort(
                                (a, b) =>
                                  (a.attribute?.position || 0) -
                                  (b.attribute?.position || 0),
                              )
                              .map((opt) => (
                                <span
                                  key={opt.id}
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                                >
                                  {opt.imageUrl && (
                                    <img
                                      src={opt.imageUrl}
                                      alt={opt.value}
                                      className="h-3.5 w-3.5 rounded-full object-cover ring-1 ring-slate-200"
                                    />
                                  )}
                                  <span className="font-medium capitalize">
                                    {opt.attribute?.name || "Option"}:
                                  </span>
                                  <span className="capitalize">
                                    {opt.value}
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          {item.id && (
                            <span className="flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md" title="Order Item ID">
                              <Hash className="h-3 w-3 text-slate-400" /> <span className="font-mono text-[10px]">{item.id}</span>
                            </span>
                          )}
                          {item.sku && (
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3 text-slate-400" /> {item.sku}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Box className="h-3 w-3 text-slate-400" /> Qty: {item.quantity}
                          </span>
                          {item.variant?.compareAtPrice > item.unitPrice && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <span className="line-through text-slate-400">
                                {formatCurrency(item.variant.compareAtPrice)}
                              </span>
                            </span>
                          )}
                          {snapshot.productType && (
                            <Badge
                              variant={isBookset ? "info" : "default"}
                              className="text-[10px]"
                            >
                              {snapshot.productType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(item.totalPrice)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order summary */}
              <div className="mt-5 border-t border-slate-200 pt-4 space-y-2">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(summary.subtotal || order.totalAmount)}
                />
                {summary.discount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`-${formatCurrency(summary.discount)}`}
                    className="text-emerald-600"
                  />
                )}
                {summary.deliveryFee > 0 && (
                  <SummaryRow
                    label="Delivery Fee"
                    value={formatCurrency(summary.deliveryFee)}
                  />
                )}
                {summary.platformFee > 0 && (
                  <SummaryRow
                    label="Platform Fee"
                    value={formatCurrency(summary.platformFee)}
                  />
                )}
                {summary.tax > 0 && (
                  <SummaryRow label="Tax" value={formatCurrency(summary.tax)} />
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                {summary.savings > 0 && (
                  <p className="text-xs text-emerald-600 text-right">
                    You saved {formatCurrency(summary.savings)} on this order
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Addresses ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AddressCard title="Shipping Address" address={shippingAddr} />
            <AddressCard title="Billing Address" address={billingAddr} />
          </div>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-6">
          {/* ── Customer Details ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                      {(
                        user?.full_name ||
                        order.shippingAddress?.recipientName ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {user?.full_name ||
                          order.shippingAddress?.recipientName ||
                          "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user?.role
                          ? user.role.charAt(0).toUpperCase() +
                          user.role.slice(1)
                          : "Customer"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Email */}
                    <InfoRow
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={user?.email || order.contactEmail || "—"}
                    />
                    {/* Phone */}
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={
                        user?.phone ||
                        order.contactPhone ||
                        order.shippingAddress?.phone ||
                        "—"
                      }
                    />
                    {/* Student Name */}
                    <InfoRow
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Student Name"
                      value={order.shippingAddress?.studentName || "—"}
                    />
                    {/* City / State */}
                    {(user?.city || user?.state) && (
                      <InfoRow
                        icon={<MapPin className="h-4 w-4" />}
                        label="Location"
                        value={[user.city, user.state]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    )}
                    {/* Account since */}
                    {user?.created_at && (
                      <InfoRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Member since"
                        value={new Date(user.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Payment Info ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Method</span>
                  <span className="text-sm font-medium text-slate-900 uppercase">
                    {order.paymentMethod || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge
                    variant={
                      paymentStatusVariant[order.paymentStatus] || "default"
                    }
                    dot
                  >
                    {(order.paymentStatus || "pending")
                      .charAt(0)
                      .toUpperCase() +
                      (order.paymentStatus || "pending").slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Currency</span>
                  <span className="text-sm font-medium text-slate-900">
                    {order.currency || "INR"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">
                    Amount
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value, className }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn("text-sm font-medium text-slate-700", className)}>
        {value}
      </span>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 break-all">{value}</p>
      </div>
    </div>
  );
}

function AddressCard({ title, address }) {
  if (!address || !address.line1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 italic">Not provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm text-slate-700">
          {address.recipientName && (
            <p className="font-semibold text-slate-900">
              {address.recipientName}
            </p>
          )}
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>{[address.city, address.state].filter(Boolean).join(", ")}</p>
          {address.postalCode && <p>PIN: {address.postalCode}</p>}
          {address.country && <p>{address.country}</p>}
          {address.phone && (
            <p className="flex items-center gap-1.5 pt-1 text-slate-500">
              <Phone className="h-3.5 w-3.5" /> {address.phone}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
