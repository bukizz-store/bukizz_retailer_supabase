import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SchoolPermissionCard } from '@/components/dashboard/SchoolPermissionCard';
import SchoolRequestModal from '@/components/dashboard/SchoolRequestModal';
import useSchoolStore from '@/store/schoolStore';
import { useWarehouse } from '@/context/WarehouseContext';
import { cn } from '@/lib/utils';
import {
    GraduationCap,
    Plus,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

export default function MySchoolsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('approved');
    const { activeWarehouse } = useWarehouse();
    const {
        openRequestModal,
        connectedSchools,
        isLoadingConnected,
        connectedError,
        fetchConnectedSchools,
    } = useSchoolStore();

    // Fetch connected schools for each status on mount
    useEffect(() => {
        fetchConnectedSchools('approved');
        fetchConnectedSchools('pending');
        fetchConnectedSchools('rejected');
    }, []);

    const handleOpenRequestModal = () => {
        const city = activeWarehouse?.address?.city || activeWarehouse?.city || '';
        openRequestModal(city);
    };

    const tabs = [
        { id: 'approved', label: 'Approved', count: connectedSchools.approved.length },
        { id: 'pending', label: 'Pending', count: connectedSchools.pending.length },
        { id: 'rejected', label: 'Rejected', count: connectedSchools.rejected.length },
    ];

    const currentSchools = connectedSchools[activeTab] || [];
    const isLoading = isLoadingConnected[activeTab];
    const error = connectedError[activeTab];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Schools</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your school partnerships and product access
                    </p>
                </div>
                <Button onClick={handleOpenRequestModal}>
                    <Plus className="h-4 w-4" />
                    Request School Access
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                        )}
                    >
                        {tab.label}
                        <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            activeTab === tab.id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                        )}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchConnectedSchools(activeTab)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-3 text-sm text-slate-500">
                        Loading {activeTab} schools…
                    </p>
                </div>
            )}

            {/* School Cards */}
            {!isLoading && !error && currentSchools.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentSchools.map((entry) => (
                        <SchoolPermissionCard
                            key={entry.schoolId}
                            entry={entry}
                            onManageProducts={() =>
                                navigate(`/dashboard/inventory/schools/${entry.schoolId}`, {
                                    state: { allowedTypes: entry.productType || [] },
                                })
                            }
                            onRetry={() => {
                                handleOpenRequestModal();
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && currentSchools.length === 0 && (
                <div className="py-16 text-center">
                    <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">
                        No {activeTab} school requests
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {activeTab === 'approved'
                            ? "Request access to schools to start selling school-specific products"
                            : activeTab === 'pending'
                                ? "You don't have any pending requests"
                                : "No rejected requests"}
                    </p>
                    {activeTab === 'approved' && (
                        <Button className="mt-4" onClick={handleOpenRequestModal}>
                            <Plus className="h-4 w-4" />
                            Request School Access
                        </Button>
                    )}
                </div>
            )}

            {/* School Request Modal (powered by schoolStore + warehouse city) */}
            <SchoolRequestModal
                onSuccess={() => {
                    fetchConnectedSchools('pending');
                }}
            />
        </div>
    );
}
