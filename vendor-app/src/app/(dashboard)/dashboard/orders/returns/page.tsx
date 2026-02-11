'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockReturns } from '@/data/mockData';
import { ReturnType, ReturnStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
    Search,
    Play,
    Download,
    ChevronDown,
    Package,
    Lightbulb,
    Clock,
    Truck,
    RotateCcw,
} from 'lucide-react';

export default function ReturnsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'important' | 'all'>('important');
    const [carrierFilter, setCarrierFilter] = useState<'all' | 'non_large' | 'large'>('all');

    // Metrics
    const yetToReachToday = mockReturns.filter(r => r.status === 'in_transit').length;
    const handedOverToday = mockReturns.filter(r => r.status === 'received').length;

    const filteredReturns = mockReturns.filter(ret => {
        const matchesSearch = searchQuery === '' ||
            ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ret.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ret.id.toLowerCase().includes(searchQuery.toLowerCase());

        // For demo, filter by tab
        if (activeTab === 'important') {
            return matchesSearch && (ret.status === 'in_transit' || ret.status === 'initiated');
        }
        return matchesSearch;
    });

    const getStatusBadge = (status: ReturnStatus) => {
        const variants: Record<ReturnStatus, { variant: 'pending' | 'info' | 'approved' | 'default'; label: string }> = {
            initiated: { variant: 'pending', label: 'Initiated' },
            in_transit: { variant: 'info', label: 'In Transit' },
            received: { variant: 'approved', label: 'Received' },
            processed: { variant: 'approved', label: 'Processed' },
            refunded: { variant: 'approved', label: 'Refunded' },
        };
        const { variant, label } = variants[status];
        return <Badge variant={variant} dot>{label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600 hover:underline cursor-pointer">Orders</span>
                <span className="text-slate-400">›</span>
                <span className="text-slate-700 font-medium">Returns</span>
            </div>

            {/* Header Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Returns</h1>
                    <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        <Play className="h-4 w-4 fill-current" />
                        Learn about New Returns Experience
                    </button>
                </div>
                <Input
                    placeholder="Order or Order Item or Return Id or tracking Id"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    className="w-80"
                />
            </div>

            {/* Tabs Row */}
            <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('important')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'important'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Important for Today
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'all'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        All Returns
                    </button>
                </div>
                <div className="flex items-center gap-2 pb-3">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-slate-600">Want to save on returns cost?</span>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                        Show How ›
                    </a>
                </div>
            </div>

            {/* Location and Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Location <span className="text-slate-900">Delhi NCR</span>
                    <ChevronDown className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Proof of Delivery
                    </button>
                    <Button variant="outline">
                        <Truck className="h-4 w-4" />
                        Reaching you Today
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="flex gap-4">
                <div className="flex-shrink-0 rounded-lg border-2 border-slate-200 bg-white p-5 min-w-36">
                    <p className="text-3xl font-bold text-slate-900">{yetToReachToday}</p>
                    <p className="text-sm text-slate-500 mt-1">Yet to reach you today</p>
                </div>
                <div className="flex-shrink-0 rounded-lg border border-slate-200 bg-white p-5 min-w-36">
                    <p className="text-3xl font-bold text-slate-900">{handedOverToday}</p>
                    <p className="text-sm text-slate-500 mt-1">Handed over today</p>
                </div>
            </div>

            {/* Carrier Filter Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setCarrierFilter('non_large')}
                        className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            carrierFilter === 'non_large'
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        Standard Delivery ({mockReturns.filter(r => r.returnType === 'customer_return').length})
                    </button>
                    <button
                        onClick={() => setCarrierFilter('large')}
                        className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            carrierFilter === 'large'
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        Express Delivery ({mockReturns.filter(r => r.returnType === 'courier_return').length})
                    </button>
                </div>
                <Button>
                    Generate OTC
                </Button>
            </div>

            {/* Returns Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Tracking ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Order ID and Order Item ID(s)
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Quantity and Product Details
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Return Type & Return ID
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReturns.map((returnItem) => (
                                <tr
                                    key={returnItem.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-mono text-sm font-semibold text-blue-600">
                                                {returnItem.trackingId || '—'}
                                            </p>
                                            {getStatusBadge(returnItem.status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-mono text-sm font-medium text-slate-900">
                                                {returnItem.orderNumber}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Item: {returnItem.id}
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
                                                    {returnItem.quantity}x {returnItem.productName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Reason: {returnItem.returnReason}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <Badge variant={returnItem.returnType === 'courier_return' ? 'pending' : 'info'}>
                                                {returnItem.returnType === 'courier_return' ? 'RTO' : 'Customer Return'}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-2">
                                                ID: {returnItem.id}
                                            </p>
                                            {returnItem.refundAmount > 0 && (
                                                <p className="text-sm font-semibold text-emerald-600 mt-1">
                                                    ₹{returnItem.refundAmount.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredReturns.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center">
                            <RotateCcw className="h-12 w-12 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">No Data</p>
                        <p className="mt-2 text-sm text-slate-500">No returns found for the selected filters</p>
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
                        <span>{filteredReturns.length > 0 ? `1-${filteredReturns.length}` : '0-0'} of {filteredReturns.length} items</span>
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
