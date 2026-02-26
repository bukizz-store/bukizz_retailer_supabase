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
    ShoppingBag, RotateCcw, XCircle,
} from 'lucide-react';

// ── Status config ──
const statusCards = [
    { id: 'all', label: 'All Orders', icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'processed', label: 'Processed', icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { id: 'shipped', label: 'Shipped', icon: <Truck className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: <ShoppingBag className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: 'delivered', label: 'Delivered', icon: <CheckCheck className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { id: 'refunded', label: 'Refunded', icon: <RotateCcw className="h-5 w-5" />, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
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

function shortenOrderId(order) {
    if (order.orderNumber) return order.orderNumber;
    const id = order.id || '';
    if (id.length <= 12) return id;
    const short = id.replace(/-/g, '').slice(-8).toUpperCase();
    return `#${short}`;
}

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

export default function AllOrdersPage() {
    const {
        orders, totalCount, isLoading, error,
        statusFilter, searchQuery, page, limit,
        fetchOrders, setStatusFilter, setSearchQuery, setPage, setLimit,
        clearError,
    } = useOrderStore();

    const { activeWarehouse } = useWarehouse();
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);

    const warehouseId = activeWarehouse?.id;

    useEffect(() => {
        fetchOrders(warehouseId);
    }, [page, limit, warehouseId, fetchOrders]);

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

    // ── Exclude only 'initialized' orders ──
    const allNonInitializedOrders = orders.filter(
        (o) => getOrderStatus(o) !== 'initialized'
    );

    // ── Status counts ──
    const counts = {
        all: allNonInitializedOrders.length,
        processed: orders.filter((o) => getOrderStatus(o) === 'processed').length,
        shipped: orders.filter((o) => getOrderStatus(o) === 'shipped').length,
        out_for_delivery: orders.filter((o) => getOrderStatus(o) === 'out_for_delivery').length,
        delivered: orders.filter((o) => getOrderStatus(o) === 'delivered').length,
        cancelled: orders.filter((o) => getOrderStatus(o) === 'cancelled').length,
        refunded: orders.filter((o) => getOrderStatus(o) === 'refunded').length,
    };

    // ── Displayed orders: filter client-side based on selected status tab ──
    const displayedOrders = statusFilter === 'all'
        ? allNonInitializedOrders
        : orders.filter((o) => getOrderStatus(o) === statusFilter);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View all orders (excluding new/unconfirmed) for{' '}
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
                            <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : (counts[card.id] ?? 0)}</span>
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

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date &amp; Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Student Name</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Amount</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Qty</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900" style={{ minWidth: '140px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Loader2 className="mx-auto mb-3 h-8 w-8 text-blue-500 animate-spin" />
                                        <p className="text-sm text-slate-500">Loading orders…</p>
                                    </td>
                                </tr>
                            ) : displayedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-600">No orders found</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {searchQuery ? 'Try adjusting your search query' : 'Confirmed orders will appear here'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayedOrders.map((order) => (
                                    <AllOrderRow
                                        key={order.id}
                                        order={order}
                                        onViewOrder={() => navigate(`/dashboard/orders/${order.items?.[0]?.id || order.id}`)}
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

function AllOrderRow({ order, onViewOrder }) {
    const shortId = shortenOrderId(order);
    const status = getOrderStatus(order);
    const studentName = order.shippingAddress?.studentName || order.contactEmail || 'Student';
    const amount = order.items?.[0]?.unitPrice || order.totalAmount || 0;
    const createdAtDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';
    const createdAtTime = order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '';

    const handleRowClick = (e) => {
        if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
        onViewOrder();
    };

    return (
        <tr className="transition-colors hover:bg-slate-50 cursor-pointer" onClick={handleRowClick}>
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
        </tr>
    );
}
