'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SchoolPermissionCard } from '@/components/dashboard/SchoolPermissionCard';
import { mockSchoolPermissions, mockSchools } from '@/data/mockData';
import { School, SchoolProductCategory } from '@/types';
import {
    Plus,
    Search,
    X,
    GraduationCap,
    MapPin,
    CheckCircle,
} from 'lucide-react';

export default function MySchoolsPage() {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<SchoolProductCategory[]>([]);

    const approvedSchools = mockSchoolPermissions.filter(p => p.status === 'approved');
    const pendingSchools = mockSchoolPermissions.filter(p => p.status === 'pending');
    const rejectedSchools = mockSchoolPermissions.filter(p => p.status === 'rejected');

    const requestedSchoolIds = mockSchoolPermissions.map(p => p.school.id);
    const availableSchools = mockSchools.filter(s =>
        !requestedSchoolIds.includes(s.id) &&
        (searchQuery === '' || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCategoryToggle = (category: SchoolProductCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSubmitRequest = () => {
        if (selectedSchool && selectedCategories.length > 0) {
            console.log('Submitting request:', { school: selectedSchool, categories: selectedCategories });
            setShowRequestModal(false);
            setSelectedSchool(null);
            setSelectedCategories([]);
            setSearchQuery('');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Schools</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your school partnerships and products
                    </p>
                </div>
                <Button onClick={() => setShowRequestModal(true)}>
                    <Plus className="h-4 w-4" />
                    Request School Access
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-emerald-100 p-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{approvedSchools.length}</p>
                            <p className="text-sm text-slate-500">Approved Schools</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-amber-100 p-3">
                            <GraduationCap className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{pendingSchools.length}</p>
                            <p className="text-sm text-slate-500">Pending Requests</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-100 p-3">
                            <X className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{rejectedSchools.length}</p>
                            <p className="text-sm text-slate-500">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approved Schools Grid */}
            {approvedSchools.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Active School Partnerships
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {approvedSchools.map((permission) => (
                            <SchoolPermissionCard
                                key={permission.id}
                                school={permission.school}
                                status={permission.status}
                                requestedCategories={permission.requestedCategories}
                                onManageProducts={() => window.location.href = `/dashboard/inventory/schools/${permission.school.id}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Pending Requests */}
            {pendingSchools.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Pending Requests
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingSchools.map((permission) => (
                            <SchoolPermissionCard
                                key={permission.id}
                                school={permission.school}
                                status={permission.status}
                                requestedCategories={permission.requestedCategories}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Rejected Requests */}
            {rejectedSchools.length > 0 && (
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Rejected Requests
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rejectedSchools.map((permission) => (
                            <SchoolPermissionCard
                                key={permission.id}
                                school={permission.school}
                                status={permission.status}
                                requestedCategories={permission.requestedCategories}
                                rejectionReason={permission.rejectionReason}
                                onRetry={() => setShowRequestModal(true)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setShowRequestModal(false)}
                    />
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-scale-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Request School Access
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Search and apply for a school franchise
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="max-h-[60vh] overflow-y-auto p-6">
                            {!selectedSchool ? (
                                <>
                                    <Input
                                        placeholder="Search schools by name or city..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        icon={<Search className="h-5 w-5" />}
                                    />
                                    <div className="mt-4 space-y-2">
                                        {availableSchools.length > 0 ? (
                                            availableSchools.map((school) => (
                                                <button
                                                    key={school.id}
                                                    onClick={() => setSelectedSchool(school)}
                                                    className="flex w-full items-center gap-4 rounded-lg border border-slate-200 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
                                                >
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white">
                                                        {school.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-slate-900">
                                                            {school.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {school.city}, {school.state}
                                                            <Badge variant="default" className="ml-2">{school.board}</Badge>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-slate-500">
                                                {searchQuery ? 'No schools found matching your search' : 'All available schools have been requested'}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Selected School */}
                                    <div className="mb-6 rounded-lg bg-slate-50 p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white">
                                                {selectedSchool.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">
                                                    {selectedSchool.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {selectedSchool.city}, {selectedSchool.state} • {selectedSchool.board} Board
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedSchool(null)}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Category Selection */}
                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-slate-700">
                                            Select categories you want to sell <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['booksets', 'uniforms', 'merchandise'] as SchoolProductCategory[]).map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => handleCategoryToggle(category)}
                                                    className={`rounded-lg border-2 p-4 text-center transition-all ${selectedCategories.includes(category)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span className="mb-2 block text-2xl">
                                                        {category === 'booksets' ? '📚' : category === 'uniforms' ? '👔' : '🎒'}
                                                    </span>
                                                    <span className={`text-sm font-medium capitalize ${selectedCategories.includes(category)
                                                            ? 'text-blue-700'
                                                            : 'text-slate-600'
                                                        }`}>
                                                        {category}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitRequest}
                                disabled={!selectedSchool || selectedCategories.length === 0}
                            >
                                Submit Request
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
