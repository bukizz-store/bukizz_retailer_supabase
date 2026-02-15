import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { orderService } from '@/services/orderService';
import { useWarehouse } from '@/context/WarehouseContext';
import {
    Search, Download, Package, MapPin,
    Loader2, AlertCircle, RefreshCw, RotateCcw,
    Calendar, ShoppingBag, GraduationCap, IndianRupee,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────
function shortenOrderId(order) {
    if (order.orderNumber) return order.orderNumber;
    const id = order.id || '';
    if (id.length <= 12) return id;
    const short = id.replace(/-/g, '').slice(-8).toUpperCase();
    return `#${short}`;
}

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

export default function ReturnsPage() {
    const { activeWarehouse } = useWarehouse();
    const navigate = useNavigate();
    const warehouseId = activeWarehouse?.id;

    // ── State ──
    const [orders, setOrders] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const searchTimeoutRef = useRef(null);

    // ── Fetch refunded orders ──
    const fetchRefundedOrders = useCallback(async () => {
        if (!warehouseId) {
            setOrders([]);
            setTotalCount(0);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await orderService.getOrders(warehouseId, {
                page, limit, status: 'refunded', search: searchQuery,
            });
            const data = response?.data || response;
            const items = data?.orders || data?.items || data || [];
            const total = data?.totalCount ?? data?.total ?? data?.pagination?.total ?? items.length;
            setOrders(Array.isArray(items) ? items : []);
            setTotalCount(total);
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch returns/refunds.';
            setError(message);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [warehouseId, page, limit, searchQuery]);

    useEffect(() => {
        fetchRefundedOrders();
    }, [fetchRefundedOrders]);

    // ── Debounced search ──
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(value);
            setPage(1);
        }, 400);
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    // ── Stats ──
    const totalRefundAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalItemsReturned = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/dashboard/orders')}>
                    Orders
                </span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-700 font-medium">Returns / Refunds</span>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Returns & Refunds</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Viewing refunded orders for{' '}
                        <span className="font-medium text-slate-700">{activeWarehouse?.name || 'your warehouse'}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={fetchRefundedOrders} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /> Refresh
                    </Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-600 hover:text-red-700">Dismiss</Button>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
                        <RotateCcw className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : totalCount}</span>
                        <p className="text-sm font-medium text-violet-600">Total Returns</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                        <IndianRupee className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : formatCurrency(totalRefundAmount)}</span>
                        <p className="text-sm font-medium text-emerald-600">Total Refunded</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : totalItemsReturned}</span>
                        <p className="text-sm font-medium text-slate-600">Items Returned</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
                <Input
                    placeholder="Search by order ID or customer..."
                    defaultValue={searchQuery}
                    onChange={handleSearchChange}
                    icon={<Search className="h-5 w-5" />}
                />
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Items</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Refund Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Refunded On</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Loader2 className="mx-auto mb-3 h-8 w-8 text-blue-500 animate-spin" />
                                        <p className="text-sm text-slate-500">Loading returns…</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center">
                                            <RotateCcw className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-600">No Returns</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {searchQuery ? 'Try adjusting your search query' : 'No refunded orders found.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const isSchoolOrder = order.items?.some(
                                        (item) => item.productSnapshot?.productType === 'bookset' || item.productSnapshot?.productType === 'uniform'
                                    );
                                    const customerName = order.shippingAddress?.recipientName || order.contactEmail || 'Customer';
                                    const city = order.shippingAddress?.city || '';
                                    const amount = Number(order.totalAmount || 0);

                                    return (
                                        <tr
                                            key={order.id}
                                            className="transition-colors hover:bg-slate-50 cursor-pointer"
                                            onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                        >
                                            {/* Order Details */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex h-10 w-10 items-center justify-center rounded-lg",
                                                        isSchoolOrder ? "bg-violet-100" : "bg-slate-100"
                                                    )}>
                                                        {isSchoolOrder
                                                            ? <GraduationCap className="h-5 w-5 text-violet-600" />
                                                            : <ShoppingBag className="h-5 w-5 text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm font-semibold text-blue-600" title={order.id}>
                                                            {shortenOrderId(order)}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{customerName}</p>
                                                {city && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                        <MapPin className="h-3 w-3" /> {city}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Items count */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center h-7 min-w-[28px] rounded-full bg-slate-100 px-2 text-sm font-medium text-slate-700">
                                                    {order.items?.length || 0}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-emerald-600">{formatCurrency(amount)}</span>
                                            </td>

                                            {/* Refunded On */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{formatDate(order.updatedAt)}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <Badge variant="refunded" dot>Refunded</Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <select
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        >
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
