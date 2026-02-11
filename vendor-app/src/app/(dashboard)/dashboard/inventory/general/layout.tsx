'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
    { id: 'products', label: 'My Products', href: '/dashboard/inventory/general' },
    { id: 'add', label: 'Add New Product', href: '/dashboard/inventory/general/add' },
    { id: 'approval', label: 'Track Approval Requests', href: '/dashboard/inventory/general/approval' },
];

export default function GeneralStoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">General Store</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage your open-market products
                </p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href ||
                            (tab.id === 'products' && pathname === '/dashboard/inventory/general');

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cn(
                                    "relative flex items-center whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors",
                                    isActive
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                )}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Page Content */}
            <div>
                {children}
            </div>
        </div>
    );
}
