import React from 'react';
import { Bell, BellOff } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Stay updated with your store activity, orders, and alerts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                        <Bell className="h-3.5 w-3.5" />
                        0 unread
                    </span>
                </div>
            </div>

            {/* Empty State Card */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col items-center justify-center px-6 py-24">
                    <div className="rounded-2xl bg-blue-50 p-6">
                        <BellOff className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-slate-900">
                        No notifications yet
                    </h3>
                    <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
                        When you receive order updates, school requests, stock alerts, or other
                        important activity — they&apos;ll show up here.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                            { label: 'Order Updates', icon: '📦' },
                            { label: 'School Requests', icon: '🎓' },
                            { label: 'Stock Alerts', icon: '⚠️' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
