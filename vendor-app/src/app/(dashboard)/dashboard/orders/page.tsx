'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockOrders } from '@/data/mockData';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
    Search,
    Play,
    Download,
    Printer,
    Filter,
    ChevronDown,
    Package,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Calendar,
    MoreHorizontal,
    Eye,
    FileText,
} from 'lucide-react';

// Order status cards config
const statusCards = [
    { id: 'pending', label: 'Pending Labels', count: 2, color: 'amber', icon: Clock },
    { id: 'confirmed', label: 'Pending RTD', count: 1, color: 'blue', icon: FileText },
    { id: 'processing', label: 'Pending Handover', count: 0, color: 'slate', icon: Package },
    { id: 'shipped', label: 'In Transit', count: 1, color: 'indigo', icon: Truck },
    { id: 'delivered', label: 'Delivered (30 days)', count: 3, color: 'emerald', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', count: 1, color: 'red', icon: XCircle },
];

export default function ActiveOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [displayMode, setDisplayMode] = useState<'compact' | 'comfortable'>('comfortable');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const filteredOrders = mockOrders.filter(order => {
        const matchesSearch = searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !selectedStatus || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: OrderStatus) => {
        const variants: Record<OrderStatus, { variant: 'pending' | 'info' | 'approved' | 'rejected' | 'default'; label: string }> = {
            pending: { variant: 'pending', label: 'Pending' },
            confirmed: { variant: 'info', label: 'Confirmed' },
            processing: { variant: 'info', label: 'Processing' },
            shipped: { variant: 'approved', label: 'Shipped' },
            delivered: { variant: 'approved', label: 'Delivered' },
            cancelled: { variant: 'rejected', label: 'Cancelled' },
        };
        const { variant, label } = variants[status];
        return <Badge variant={variant} dot>{label}</Badge>;
    };

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleAllOrders = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Home</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-700 font-medium">My Orders</span>
            </div>

            {/* Header Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
                    <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        <Play className="h-4 w-4 fill-current" />
                        Learn how to use Active Orders
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search by Order ID / Order Item ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                        className="w-64"
                    />
                    <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Delhi NCR
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Status Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {statusCards.map((card) => {
                    const Icon = card.icon;
                    const isSelected = selectedStatus === card.id;
                    return (
                        <button
                            key={card.id}
                            onClick={() => setSelectedStatus(isSelected ? null : card.id)}
                            className={cn(
                                "relative flex flex-col rounded-lg border-2 p-4 text-left transition-all",
                                isSelected
                                    ? `border-${card.color}-500 bg-${card.color}-50`
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                            style={{
                                borderColor: isSelected ? `var(--${card.color}-500, #3b82f6)` : undefined,
                                backgroundColor: isSelected ? `var(--${card.color}-50, #eff6ff)` : undefined,
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-2xl font-bold",
                                    isSelected ? `text-${card.color}-700` : "text-slate-900"
                                )}>
                                    {card.count}
                                </span>
                                <Icon className={cn(
                                    "h-5 w-5",
                                    isSelected ? `text-${card.color}-500` : "text-slate-400"
                                )} />
                            </div>
                            <span className={cn(
                                "mt-1 text-xs font-medium",
                                isSelected ? `text-${card.color}-600` : "text-slate-500"
                            )}>
                                {card.label}
                            </span>
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Bulk Actions
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Cancel Orders
                    </button>
                    <Button size="sm">
                        Generate Labels
                    </Button>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">Display Preference</span>
                    <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                        <button
                            onClick={() => setDisplayMode('compact')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium transition-colors",
                                displayMode === 'compact'
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Compact
                        </button>
                        <button
                            onClick={() => setDisplayMode('comfortable')}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium transition-colors",
                                displayMode === 'comfortable'
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-white text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Comfortable
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                        Download Seller Barcode
                    </button>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                        Get Bukizz Packaging
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Filter className="h-5 w-5 text-slate-400" />
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Order date range</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Order Type</option>
                    <option>School Bundle</option>
                    <option>General</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Shipment type</option>
                    <option>Standard</option>
                    <option>Express</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Urgency</option>
                    <option>High Priority</option>
                    <option>Normal</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Channel</option>
                    <option>Website</option>
                    <option>App</option>
                </select>
                <input
                    type="text"
                    placeholder="SKU"
                    className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <Button variant="outline" size="sm">
                    Apply
                </Button>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="w-12 px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleAllOrders}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                    />
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">
                                    Order ID
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">
                                    Product Information
                                </th>
                                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                                    Amount
                                </th>
                                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-900">
                                    Dispatch By Date
                                </th>
                                <th className="w-16 px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className={cn(
                                        "transition-colors hover:bg-slate-50",
                                        selectedOrders.includes(order.id) && "bg-blue-50"
                                    )}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => toggleOrderSelection(order.id)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-blue-600">
                                                {order.id}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {order.customerName}
                                            </p>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                <Package className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {order.items[0]?.productName || 'Product'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {order.items.length} item(s) • {order.orderType === 'school_bundle' ? 'School Bundle' : 'General'}
                                                </p>
                                                {order.schoolName && (
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        🎓 {order.schoolName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <p className="text-sm font-bold text-slate-900">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm text-slate-700">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-16 text-center">
                        <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">No data to display</p>
                        <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <select className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span>Items per page</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{filteredOrders.length > 0 ? `1-${filteredOrders.length}` : '0-0'} of {filteredOrders.length} items</span>
                        <span>•</span>
                        <span>1 of 1 pages</span>
                        <div className="flex items-center gap-1 ml-4">
                            <button className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
                                ‹
                            </button>
                            <button className="rounded border border-blue-600 bg-blue-600 px-3 py-1 text-sm text-white">
                                1
                            </button>
                            <button className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
