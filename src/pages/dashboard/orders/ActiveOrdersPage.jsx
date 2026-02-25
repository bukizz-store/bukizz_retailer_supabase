import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import useOrderStore from '@/store/orderStore';
import { useWarehouse } from '@/context/WarehouseContext';
import useAuthStore from '@/store/authStore';
import {
    Search, Download, Package, Truck,
    Clock, CheckCircle, GraduationCap, MapPin,
    Loader2, AlertCircle, RefreshCw, Printer, CheckCheck,
    ShoppingBag,
} from 'lucide-react';

// ── Status config matching server enum: initialized → processed → shipped → out_for_delivery → delivered ──
const statusCards = [
    { id: 'all', label: 'All Orders', icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'initialized', label: 'New', icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    { id: 'processed', label: 'Processed', icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { id: 'shipped', label: 'Shipped', icon: <Truck className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
];

// Map server status enum to readable labels
const statusLabelMap = {
    initialized: 'New',
    processed: 'Processed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

// Map server status to Badge variant
const statusBadgeVariant = {
    initialized: 'initialized',
    processed: 'processing',
    shipped: 'shipped',
    out_for_delivery: 'out_for_delivery',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'refunded',
};

/**
 * Truncate a long UUID-based order ID into a short display format.
 * e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890" → "#C3D4EF12"
 * Prefers order_number if present.
 */
function shortenOrderId(order) {
    if (order.orderNumber) return order.orderNumber;
    const id = order.id || '';
    if (id.length <= 12) return id;
    const short = id.replace(/-/g, '').slice(-8).toUpperCase();
    return `#${short}`;
}

/**
 * Derive the effective order status from the items array.
 * The status lives at `order.items[].status`, not `order.status`.
 * Uses the least-progressed item status as the bottleneck.
 */
const STATUS_PRIORITY = ['initialized', 'processed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

function getOrderStatus(order) {
    const items = order.items || [];
    if (items.length === 0) return order.status || 'initialized';
    let minIndex = STATUS_PRIORITY.length;
    for (const item of items) {
        const idx = STATUS_PRIORITY.indexOf(item.status);
        if (idx !== -1 && idx < minIndex) minIndex = idx;
    }
    return minIndex < STATUS_PRIORITY.length ? STATUS_PRIORITY[minIndex] : (order.status || 'initialized');
}

export default function ActiveOrdersPage() {
    const {
        orders, totalCount, isLoading, isUpdatingStatus, error,
        statusFilter, searchQuery, page, limit,
        fetchOrders, setStatusFilter, setSearchQuery, setPage, setLimit,
        updateOrderStatus, clearError,
    } = useOrderStore();

    const { activeWarehouse } = useWarehouse();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [selectedOrders, setSelectedOrders] = useState([]);
    const searchTimeoutRef = useRef(null);

    const warehouseId = activeWarehouse?.id;

    // ── Fetch orders whenever page, limit, or warehouse changes ──
    // Status filtering is done client-side so counts stay accurate.
    useEffect(() => {
        fetchOrders(warehouseId);
    }, [page, limit, warehouseId, fetchOrders]);

    // ── Debounced search ──
    const handleSearchChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSearchQuery(value);
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
                fetchOrders(warehouseId);
            }, 400);
        },
        [setSearchQuery, fetchOrders, warehouseId]
    );

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    // ── Active (non-terminal) orders — exclude delivered/cancelled/refunded ──
    const activeOrders = orders.filter(
        (o) => !['delivered', 'cancelled', 'refunded'].includes(getOrderStatus(o))
    );

    // ── Status counts (always computed from full orders list) ──
    const counts = {
        all: activeOrders.length,
        initialized: orders.filter((o) => getOrderStatus(o) === 'initialized').length,
        processed: orders.filter((o) => getOrderStatus(o) === 'processed').length,
        shipped: orders.filter((o) => getOrderStatus(o) === 'shipped').length,
    };

    // ── Displayed orders: filter client-side based on selected status tab ──
    const displayedOrders = statusFilter === 'all'
        ? activeOrders
        : orders.filter((o) => getOrderStatus(o) === statusFilter);

    const toggleOrderSelection = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        setSelectedOrders(
            selectedOrders.length === displayedOrders.length ? [] : displayedOrders.map((o) => o.id)
        );
    };

    // ── Actions ──
    const handleUpdateStatus = async (orderId, currentStatus) => {
        const nextStatus = currentStatus === 'initialized' ? 'processed' : 'shipped';
        const note = currentStatus === 'initialized' ? 'Confirmed by retailer' : 'Shipped by retailer';
        const result = await updateOrderStatus(orderId, nextStatus, note);
        if (result.success) fetchOrders(warehouseId);
    };

    const handlePrintLabel = (orderId) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        const address = order.shippingAddress || {};
        const addressLines = [
            `Student: ${address.studentName}`,
            " ",
            address.recipientName || order.contactEmail || 'Customer',
            address.line1,
            address.line2,
            `${address.city || ''}${address.city && address.state ? ', ' : ''}${address.state || ''} ${address.postalCode || ''}`.trim(),
            order.contactPhone ? `Phone: ${order.contactPhone}` : ''
        ].filter(Boolean).join('<br/>');

        const retailerName = user?.fullName || user?.name || 'Retailer Name';
        const warehouseName = activeWarehouse?.name || 'Warehouse Name';
        const qrData = `${order.items?.[0]?.id || ''} , ${order.id}`;

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
                            <img src="${window.location.origin}/logo.svg" alt="bukizz" style="height: 48px;" onerror="this.style.display='none'" />
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
                    <div class="text-bold mb-3">Order ID: ${order.id}</div>
                    
                    <div class="text-bold mb-2">Details:</div>
                    <table class="mb-4">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Payment Method</th> 
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                            <tr>
                                <td>${item.title || item.productSnapshot?.name} - ${item.schoolName || ''}</td>
                                <td style="text-align: center;">Prepaid</td>
                            </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>
                    
                    <div class="mb-2" style="margin-top: 32px;">
                        Payment Due on Receipt: ${order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}
                    </div>
                </div>
            </div>
            </body></html>`;
        const printWindow = window.open('', '_blank', 'width=600,height=800');
        if (printWindow) {
            printWindow.document.write(labelContent);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    };

    const handleBulkUpdateStatus = async () => {
        for (const orderId of selectedOrders) {
            const order = orders.find((o) => o.id === orderId);
            const status = getOrderStatus(order);
            if (order && (status === 'initialized' || status === 'processed')) {
                const nextStatus = status === 'initialized' ? 'processed' : 'shipped';
                const note = status === 'initialized' ? 'Bulk confirmed by retailer' : 'Bulk shipped by retailer';
                await updateOrderStatus(orderId, nextStatus, note);
            }
        }
        setSelectedOrders([]);
        fetchOrders(warehouseId);
    };

    const handleBulkPrintLabels = () => {
        selectedOrders.forEach((id) => handlePrintLabel(id));
    };

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Active Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage and track orders for{' '}
                        <span className="font-medium text-slate-700">{activeWarehouse?.name || 'your warehouse'}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => fetchOrders(warehouseId)} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />Refresh
                    </Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <Button variant="ghost" size="sm" onClick={clearError} className="text-red-600 hover:text-red-700">Dismiss</Button>
                </div>
            )}

            {/* Status Filter Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statusCards.map((card) => (
                    <button key={card.id} onClick={() => setStatusFilter(card.id)}
                        className={cn("relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
                            statusFilter === card.id ? `${card.bgColor} ${card.borderColor} shadow-md` : "bg-white border-slate-200"
                        )}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg",
                            statusFilter === card.id ? card.bgColor : "bg-slate-100",
                            statusFilter === card.id ? card.color : "text-slate-400"
                        )}>{card.icon}</div>
                        <div>
                            <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : counts[card.id]}</span>
                            <p className={cn("text-sm font-medium", statusFilter === card.id ? card.color : "text-slate-600")}>{card.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
                <Input placeholder="Search by order ID or customer..." value={searchQuery}
                    onChange={handleSearchChange} icon={<Search className="h-5 w-5" />} />
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                    <span className="text-sm font-medium text-blue-700">{selectedOrders.length} selected</span>
                    <Button variant="outline" size="sm" onClick={handleBulkUpdateStatus} disabled={isUpdatingStatus}>
                        <CheckCheck className="h-4 w-4" />Update Selected Status
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkPrintLabels}>
                        <Printer className="h-4 w-4" />Print Labels
                    </Button>
                </div>
            )}

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left">
                                    <input type="checkbox" checked={selectedOrders.length === displayedOrders.length && displayedOrders.length > 0}
                                        onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date & Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Student Name</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Amount</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Qty</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900" style={{ minWidth: '120px' }}>Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Loader2 className="mx-auto mb-3 h-8 w-8 text-blue-500 animate-spin" />
                                        <p className="text-sm text-slate-500">Loading orders…</p>
                                    </td>
                                </tr>
                            ) : displayedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-600">No orders found</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {searchQuery ? 'Try adjusting your search query' : 'Orders will appear here once customers place them'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayedOrders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        isSelected={selectedOrders.includes(order.id)}
                                        onToggleSelect={() => toggleOrderSelection(order.id)}
                                        onConfirm={() => handleUpdateStatus(order.id, status)}
                                        onPrintLabel={() => handlePrintLabel(order.id)}
                                        onViewOrder={() => navigate(`/dashboard/orders/${order.id}`)}
                                        isUpdating={isUpdatingStatus}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <select className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                            value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>Items per page</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>Page {page} of {totalPages || 1} · {totalCount} total</span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Individual Order Row ───────────────────────────────────────────────────────

function OrderRow({ order, isSelected, onToggleSelect, onConfirm, onPrintLabel, onViewOrder, isUpdating }) {
    const shortId = shortenOrderId(order);
    const status = getOrderStatus(order);
    // Detect school/bookset orders from items or metadata
    const isSchoolOrder = order.items?.some(
        (item) => item.productSnapshot?.productType === 'bookset' || item.productSnapshot?.productType === 'uniform'
    ) || order.metadata?.orderSummary?.items?.some(
        (item) => item.productSnapshot?.productType === 'bookset' || item.productSnapshot?.productType === 'uniform'
    );
    const studentName = order.shippingAddress?.studentName || order.contactEmail || 'Student';
    const amount = order.items?.[0].unitPrice || order.totalAmount || 0;
    const createdAtDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';
    const createdAtTime = order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '';

    const handleRowClick = (e) => {
        // Don't navigate if clicking checkbox or buttons
        if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
        onViewOrder();
    };

    return (
        <tr className={cn("transition-colors hover:bg-slate-50 cursor-pointer", isSelected && "bg-blue-50/50")}
            onClick={handleRowClick}>
            <td className="px-6 py-4">
                <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="h-4 w-4 rounded border-slate-300" />
            </td>

            {/* Order ID */}
            <td className="px-6 py-4">
                <p className="font-mono text-sm font-medium text-blue-600 truncate max-w-[120px]" title={order.id}>{shortId}</p>
            </td>

            {/* Order Details */}
            <td className="px-6 py-4 w-1/4">
                <div className="flex flex-col gap-1">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="text-sm">
                            <p className="font-medium text-slate-900 line-clamp-2" title={item.title || item.productSnapshot?.name}>
                                {item.schoolName ? `${item.title || item.productSnapshot?.name} - ${item.schoolName}` : (item.title || item.productSnapshot?.name)}
                            </p>
                            {(item.variantDetail || item.productSnapshot?.variantName) && (
                                <p className="text-xs text-slate-500">{item.variantDetail || item.productSnapshot?.variantName}</p>
                            )}
                        </div>
                    ))}
                    {(!order.items || order.items.length === 0) && <span className="text-sm text-slate-400">No details</span>}
                </div>
            </td>

            {/* Date & Time */}
            <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-sm text-slate-900">{createdAtDate}</p>
                <p className="text-xs text-slate-500 mt-0.5">{createdAtTime}</p>
            </td>

            {/* Student Name */}
            <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{studentName}</p>
            </td>

            {/* Amount */}
            <td className="px-6 py-4 text-right font-bold text-slate-900">₹{amount.toLocaleString()}</td>

            {/* Qty */}
            <td className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-slate-900">
                    {order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || order.itemCount || 0}
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <Badge variant={statusBadgeVariant[status] || 'default'} dot>
                    {statusLabelMap[status] || status}
                </Badge>
            </td>

            {/* Actions: Print Label + Confirm */}
            <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={onPrintLabel} title="Print shipping label"
                        className="text-slate-600 hover:text-slate-900">
                        <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={onConfirm}
                        disabled={isUpdating || !['initialized', 'processed'].includes(status)}
                        title={status === 'initialized' ? 'Confirm Order' : (status === 'processed' ? 'Ship Order' : `Already ${statusLabelMap[status] || status}`)}
                        className={cn(
                            (status === 'initialized' || status === 'processed')
                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                                : 'text-slate-400 cursor-not-allowed'
                        )}>
                        {status === 'processed' ? <Truck className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                </div>
            </td>
        </tr>
    );
}
