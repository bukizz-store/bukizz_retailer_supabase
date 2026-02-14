import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    MapPin,
    Users,
    GraduationCap,
    Settings,
    ChevronRight,
    Calendar,
    Phone,
    Mail,
    Globe,
    Hash,
    Loader2,
} from 'lucide-react';

const boardColors = {
    CBSE: 'bg-blue-100 text-blue-700',
    ICSE: 'bg-purple-100 text-purple-700',
    State: 'bg-amber-100 text-amber-700',
    IB: 'bg-green-100 text-green-700',
    Cambridge: 'bg-red-100 text-red-700',
};

const productTypeLabels = {
    bookset: 'Bookset',
    uniform: 'Uniform',
    stationary: 'Stationary',
    notebooks: 'Notebooks',
    uniforms: 'Uniforms',
};

/**
 * Formats an ISO date string to a readable date.
 */
function formatDate(dateStr) {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

/**
 * SchoolPermissionCard
 *
 * Accepts a full `entry` object from the connected-schools API:
 * {
 *   retailerId, schoolId, status, productType[], linkedAt, updatedAt,
 *   school: { id, name, address, city, pincode, board, logo_url, ... }
 * }
 */
export function SchoolPermissionCard({ entry, onManageProducts, onRetry }) {
    const { status, productType = [], linkedAt, updatedAt, school = {} } = entry;

    const statusConfig = {
        pending: { variant: 'pending', label: 'Pending Approval' },
        approved: { variant: 'approved', label: 'Active' },
        rejected: { variant: 'rejected', label: 'Rejected' },
    };

    const currentStatus = statusConfig[status] || statusConfig.pending;

    return (
        <div
            className={cn(
                'group relative rounded-xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-xl',
                'dark:bg-slate-900 dark:border-slate-800',
                status === 'approved' && 'hover:border-violet-300 dark:hover:border-violet-700',
                status === 'pending' && 'hover:border-amber-300 dark:hover:border-amber-700',
                status === 'rejected' && 'hover:border-red-300 dark:hover:border-red-700'
            )}
        >
            {/* Status accent bar */}
            <div
                className={cn(
                    'absolute top-0 left-0 right-0 h-1',
                    status === 'approved' && 'bg-gradient-to-r from-emerald-400 to-green-500',
                    status === 'pending' && 'bg-gradient-to-r from-amber-400 to-orange-400',
                    status === 'rejected' && 'bg-gradient-to-r from-red-400 to-rose-400'
                )}
            />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {school.logo_url ? (
                        <img
                            src={school.logo_url}
                            alt={school.name}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                        />
                    ) : (
                        <div
                            className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0',
                                'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                            )}
                        >
                            {school.name?.charAt(0) || 'S'}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {school.name || 'Unknown School'}
                            </h3>
                            <Badge variant={currentStatus.variant} dot>
                                {currentStatus.label}
                            </Badge>
                        </div>
                        {school.affiliation_number && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {school.affiliation_number}
                            </p>
                        )}
                    </div>
                </div>

                {/* School details */}
                <div className="space-y-2 mb-4">
                    {/* City / Pincode */}
                    {school.city && (
                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="truncate">
                                {school.city}
                                {school.state && `, ${school.state}`}
                                {school.pincode && ` - ${school.pincode}`}
                            </span>
                        </div>
                    )}

                    {/* Contact: Phone */}
                    {school.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{school.phone}</span>
                        </div>
                    )}

                    {/* Contact: Email */}
                    {school.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{school.email}</span>
                        </div>
                    )}

                    {/* Website */}
                    {school.website && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <a
                                href={school.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-blue-600 hover:underline"
                            >
                                {school.website}
                            </a>
                        </div>
                    )}

                    {/* Student count */}
                    {school.student_count && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{Number(school.student_count).toLocaleString()} students</span>
                        </div>
                    )}
                </div>

                {/* Board badge */}
                {school.board && (
                    <div className="flex items-center gap-2 mb-4">
                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                boardColors[school.board] || 'bg-slate-100 text-slate-700'
                            )}
                        >
                            <GraduationCap className="w-3.5 h-3.5" />
                            {school.board} Board
                        </span>
                    </div>
                )}

                {/* Product Types */}
                {productType.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {productType.map((type) => (
                            <span
                                key={type}
                                className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 capitalize"
                            >
                                {productTypeLabels[type] || type}
                            </span>
                        ))}
                    </div>
                )}

                {/* Linked / Updated timestamps */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-slate-400">
                    {linkedAt && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Linked {formatDate(linkedAt)}
                        </span>
                    )}
                    {updatedAt && updatedAt !== linkedAt && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Updated {formatDate(updatedAt)}
                        </span>
                    )}
                </div>

                {/* Rejection reason */}
                {status === 'rejected' && entry.rejectionReason && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 mb-4">
                        <p className="text-sm text-red-700 dark:text-red-400">
                            <strong>Reason:</strong> {entry.rejectionReason}
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
                    {status === 'pending' && (
                        <Button
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-600 hover:bg-amber-50 cursor-default"
                            size="sm"
                            disabled
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Awaiting Approval
                        </Button>
                    )}
                    {status === 'rejected' && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            size="sm"
                        >
                            Retry Application
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
