'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockCancellations } from '@/data/mockData';
import { CancellationReason } from '@/types';
import { cn } from '@/lib/utils';
import {
    Search,
    Play,
    Download,
    ChevronDown,
    Package,
    XCircle,
    AlertTriangle,
    Calendar,
    User,
    Store,
    Filter,
} from 'lucide-react';

export default function CancelledOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'seller' | 'customer'>('all');
    const [dateRange, setDateRange] = useState('last30');

    // Metrics
    const sellerCancelled = mockCancellations.filter(c => c.cancellationType === 'seller_cancelled').length;
    const customerCancelled = mockCancellations.filter(c => c.cancellationType === 'customer_cancelled').length;
    const totalLostRevenue = mockCancellations.reduce((sum, c) => sum + c.orderAmount, 0);

    const filteredCancellations = mockCancellations.filter(canc => {
        const matchesSearch = searchQuery === '' ||
            canc.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            canc.productName.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'seller') {
            return matchesSearch && canc.cancellationType === 'seller_cancelled';
        } else if (activeTab === 'customer') {
            return matchesSearch && canc.cancellationType === 'customer_cancelled';
        }
        return matchesSearch;
    });

    const getReasonLabel = (reason: CancellationReason) => {
        const labels: Record<CancellationReason, string> = {
            out_of_stock: 'Out of Stock',
            price_error: 'Price Error',
            customer_request: 'Customer Request',
            payment_failed: 'Payment Failed',
            address_issue: 'Address Issue',
            other: 'Other',
        };
        return labels[reason];
    };

    const getReasonBadge = (reason: CancellationReason) => {
        const colors: Record<CancellationReason, string> = {
            out_of_stock: 'bg-red-100 text-red-700',
            price_error: 'bg-amber-100 text-amber-700',
            customer_request: 'bg-blue-100 text-blue-700',
            payment_failed: 'bg-orange-100 text-orange-700',
            address_issue: 'bg-purple-100 text-purple-700',
            other: 'bg-slate-100 text-slate-700',
        };
        return (
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", colors[reason])}>
                {getReasonLabel(reason)}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Orders</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-700 font-medium">Cancellations</span>
            </div>

            {/* Header Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Cancellations</h1>
                    <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        <Play className="h-4 w-4 fill-current" />
                        Reduce Cancellation Rate
                    </button>
                </div>
                <Input
                    placeholder="Search by Order ID or Product"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    className="w-72"
                />
            </div>

            {/* Tabs + Summary Row */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'all'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        All Cancellations
                    </button>
                    <button
                        onClick={() => setActiveTab('seller')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'seller'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Seller Cancelled
                    </button>
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'customer'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Customer Cancelled
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="flex gap-3">
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                        <Store className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="text-xs text-red-600">Seller Cancelled</p>
                            <p className="text-lg font-bold text-red-900">{sellerCancelled}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-blue-600">Customer Cancelled</p>
                            <p className="text-lg font-bold text-blue-900">{customerCancelled}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                        <AlertTriangle className="h-5 w-5 text-slate-600" />
                        <div>
                            <p className="text-xs text-slate-600">Lost Revenue</p>
                            <p className="text-lg font-bold text-slate-900">₹{totalLostRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                    <option value="last7">Last 7 days</option>
                    <option value="last30">Last 30 days</option>
                    <option value="last90">Last 90 days</option>
                    <option value="custom">Custom range</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>All Reasons</option>
                    <option>Out of Stock</option>
                    <option>Price Error</option>
                    <option>Customer Request</option>
                    <option>Payment Failed</option>
                    <option>Address Issue</option>
                </select>
                <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>All Order Types</option>
                    <option>School Bundle</option>
                    <option>General</option>
                </select>
                <div className="flex-1" />
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Cancellations Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Order Details
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Product Information
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Reason
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Cancelled On
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCancellations.map((cancellation) => (
                                <tr
                                    key={cancellation.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-blue-600">
                                                {cancellation.orderNumber}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                ID: {cancellation.id}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                <Package className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {cancellation.productName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Qty: {cancellation.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge
                                            variant={cancellation.cancellationType === 'seller_cancelled' ? 'rejected' : 'info'}
                                        >
                                            {cancellation.cancellationType === 'seller_cancelled' ? 'Seller' : 'Customer'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getReasonBadge(cancellation.reason)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-bold text-slate-900">
                                            ₹{cancellation.orderAmount.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm text-slate-700">
                                                    {new Date(cancellation.cancelledAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    By: {cancellation.cancelledBy}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCancellations.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center">
                            <XCircle className="h-12 w-12 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">No Cancellations</p>
                        <p className="mt-2 text-sm text-slate-500">Great job! No cancellations found for the selected filters</p>
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
                        <span>{filteredCancellations.length > 0 ? `1-${filteredCancellations.length}` : '0-0'} of {filteredCancellations.length} items</span>
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
