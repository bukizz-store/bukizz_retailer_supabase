'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDashboardStats, mockActionItems, mockOrders } from '@/data/mockData';
import {
    TrendingUp,
    ShoppingCart,
    AlertTriangle,
    GraduationCap,
    Package,
    ArrowUpRight,
    ArrowRight,
    ChevronRight,
    Plus,
} from 'lucide-react';

const statCards = [
    {
        title: 'Total Sales',
        value: `₹${(mockDashboardStats.totalSales / 1000).toFixed(1)}K`,
        change: '+12.5%',
        changeType: 'positive',
        icon: TrendingUp,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
    },
    {
        title: 'Active Orders',
        value: mockDashboardStats.activeOrders.toString(),
        change: '+3 today',
        changeType: 'positive',
        icon: ShoppingCart,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        title: 'Low Stock Alerts',
        value: mockDashboardStats.lowStockAlerts.toString(),
        change: 'Need attention',
        changeType: 'warning',
        icon: AlertTriangle,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
    {
        title: 'Active Schools',
        value: mockDashboardStats.totalSchools.toString(),
        change: '1 pending',
        changeType: 'neutral',
        icon: GraduationCap,
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
    },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, Rahul 👋
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Here&apos;s what&apos;s happening with your store today.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                        <Package className="h-4 w-4" />
                        Add Product
                    </Button>
                    <Link href="/dashboard/inventory/schools">
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Request School Access
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500">
                                    {stat.title}
                                </p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {stat.value}
                                </p>
                                <p className={`flex items-center gap-1 text-sm ${stat.changeType === 'positive' ? 'text-emerald-600' :
                                        stat.changeType === 'warning' ? 'text-amber-600' :
                                            'text-slate-500'
                                    }`}>
                                    {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4" />}
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`rounded-lg p-3 ${stat.iconBg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Action Center - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">Action Center</h2>
                            <Link href="/dashboard/notifications" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                View all <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 p-4">
                            {mockActionItems.slice(0, 4).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-slate-50"
                                >
                                    <div className={`flex-shrink-0 rounded-lg p-2.5 ${item.type === 'school_request' ? 'bg-violet-100' :
                                            item.type === 'product_approval' ? 'bg-blue-100' :
                                                item.type === 'low_stock' ? 'bg-amber-100' :
                                                    'bg-slate-100'
                                        }`}>
                                        {item.type === 'school_request' && <GraduationCap className="h-5 w-5 text-violet-600" />}
                                        {item.type === 'product_approval' && <Package className="h-5 w-5 text-blue-600" />}
                                        {item.type === 'low_stock' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                        {item.type === 'order' && <ShoppingCart className="h-5 w-5 text-slate-600" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium text-slate-900">
                                                {item.title}
                                            </p>
                                            <Badge
                                                variant={
                                                    item.status === 'Pending' ? 'pending' :
                                                        item.status === 'Rejected' ? 'rejected' :
                                                            item.status === 'Low Stock' ? 'warning' :
                                                                'default'
                                                }
                                                dot
                                            >
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
                            <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                View all <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 p-4">
                            {mockOrders.slice(0, 4).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                                >
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${order.orderType === 'school_bundle'
                                            ? 'bg-violet-100'
                                            : 'bg-slate-100'
                                        }`}>
                                        {order.orderType === 'school_bundle' ? (
                                            <GraduationCap className="h-5 w-5 text-violet-600" />
                                        ) : (
                                            <Package className="h-5 w-5 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">
                                            {order.orderNumber}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant={order.status as any} className="flex-shrink-0 text-xs">
                                        {order.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Add School Product', href: '/dashboard/inventory/schools', icon: GraduationCap, bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
                    { label: 'Add General Product', href: '/dashboard/inventory/general', icon: Package, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
                    { label: 'View All Orders', href: '/dashboard/orders', icon: ShoppingCart, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                    { label: 'Update Profile', href: '/dashboard/settings', icon: TrendingUp, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
                ].map((action, index) => (
                    <Link key={index} href={action.href}>
                        <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
                            <div className={`rounded-lg p-3 ${action.bgColor}`}>
                                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                            </div>
                            <span className="flex-1 font-medium text-slate-900">{action.label}</span>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
