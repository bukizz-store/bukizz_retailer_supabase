'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { School } from '@/types';
import { SchoolRequestStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, Users, GraduationCap, Settings, ChevronRight } from 'lucide-react';

interface SchoolPermissionCardProps {
    school: School;
    status: SchoolRequestStatus;
    requestedCategories: string[];
    rejectionReason?: string;
    onManageProducts?: () => void;
    onRetry?: () => void;
}

export function SchoolPermissionCard({
    school,
    status,
    requestedCategories,
    rejectionReason,
    onManageProducts,
    onRetry,
}: SchoolPermissionCardProps) {
    const statusConfig = {
        pending: {
            variant: 'pending' as const,
            label: 'Pending Approval',
        },
        approved: {
            variant: 'approved' as const,
            label: 'Active',
        },
        rejected: {
            variant: 'rejected' as const,
            label: 'Rejected',
        },
    };

    const boardColors: Record<string, string> = {
        CBSE: 'bg-blue-100 text-blue-700',
        ICSE: 'bg-purple-100 text-purple-700',
        State: 'bg-amber-100 text-amber-700',
        IB: 'bg-green-100 text-green-700',
        Cambridge: 'bg-red-100 text-red-700',
    };

    return (
        <div
            className={cn(
                "group relative rounded-xl border bg-white overflow-hidden transition-all duration-300",
                "dark:bg-slate-900 dark:border-slate-800",
                status === 'approved' && "hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700",
                status === 'pending' && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20",
                status === 'rejected' && "border-red-200 bg-red-50/50 dark:bg-red-950/20"
            )}
        >
            {/* Status banner for pending/rejected */}
            {status !== 'approved' && (
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    status === 'pending' && "bg-gradient-to-r from-amber-400 to-orange-400",
                    status === 'rejected' && "bg-gradient-to-r from-red-400 to-rose-400"
                )} />
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {/* School logo placeholder */}
                    <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0",
                        "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                    )}>
                        {school.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {school.name}
                            </h3>
                            <Badge variant={statusConfig[status].variant} dot>
                                {statusConfig[status].label}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {school.code}
                        </p>
                    </div>
                </div>

                {/* School details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{school.city}, {school.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{school.studentCount?.toLocaleString() || 'N/A'} students</span>
                    </div>
                </div>

                {/* Board badge */}
                <div className="flex items-center gap-2 mb-4">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        boardColors[school.board] || 'bg-slate-100 text-slate-700'
                    )}>
                        <GraduationCap className="w-3.5 h-3.5" />
                        {school.board} Board
                    </span>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {requestedCategories.map((category) => (
                        <span
                            key={category}
                            className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize"
                        >
                            {category}
                        </span>
                    ))}
                </div>

                {/* Rejection reason */}
                {status === 'rejected' && rejectionReason && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 mb-4">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            <strong>Reason:</strong> {rejectionReason}
                        </p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                    {status === 'approved' && (
                        <Button
                            onClick={onManageProducts}
                            className="flex-1 group-hover:shadow-lg"
                            size="sm"
                        >
                            <Settings className="w-4 h-4" />
                            Manage Products
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    )}
                    {status === 'rejected' && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                        >
                            Retry Application
                        </Button>
                    )}
                    {status === 'pending' && (
                        <div className="w-full text-center py-2 text-sm text-amber-600 dark:text-amber-400">
                            Awaiting admin review...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
