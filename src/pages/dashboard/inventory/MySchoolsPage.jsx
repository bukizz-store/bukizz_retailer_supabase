import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SchoolPermissionCard } from '@/components/dashboard/SchoolPermissionCard';
import { mockSchoolRequests, mockAvailableSchools } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
    GraduationCap,
    Search,
    Plus,
    X,
    MapPin,
    ChevronRight,
    Check,
} from 'lucide-react';

export default function MySchoolsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('approved');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [schoolSearch, setSchoolSearch] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const approvedSchools = mockSchoolRequests.filter(s => s.status === 'approved');
    const pendingSchools = mockSchoolRequests.filter(s => s.status === 'pending');
    const rejectedSchools = mockSchoolRequests.filter(s => s.status === 'rejected');

    const filteredAvailableSchools = mockAvailableSchools.filter(
        school => schoolSearch === '' ||
            school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
            school.address.toLowerCase().includes(schoolSearch.toLowerCase())
    );

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const tabs = [
        { id: 'approved', label: 'Approved', count: approvedSchools.length },
        { id: 'pending', label: 'Pending', count: pendingSchools.length },
        { id: 'rejected', label: 'Rejected', count: rejectedSchools.length },
    ];

    const getCurrentSchools = () => {
        switch (activeTab) {
            case 'approved': return approvedSchools;
            case 'pending': return pendingSchools;
            case 'rejected': return rejectedSchools;
            default: return [];
        }
    };

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
                <Button onClick={() => setShowRequestModal(true)}>
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

            {/* School Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getCurrentSchools().map((request) => (
                    <SchoolPermissionCard
                        key={request.id}
                        school={request.school}
                        status={request.status}
                        requestedCategories={request.requestedCategories}
                        rejectionReason={request.rejectionReason}
                        onManageProducts={() => navigate(`/dashboard/inventory/schools/${request.school.id}`)}
                        onRetry={() => console.log('Retry request for', request.school.id)}
                    />
                ))}
            </div>

            {getCurrentSchools().length === 0 && (
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
                        <Button className="mt-4" onClick={() => setShowRequestModal(true)}>
                            <Plus className="h-4 w-4" />
                            Request School Access
                        </Button>
                    )}
                </div>
            )}

            {/* Request School Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRequestModal(false)} />
                    <div className="relative z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-900">Request School Access</h2>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Search Schools */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Search for a school
                                </label>
                                <Input
                                    placeholder="Search by school name or location..."
                                    value={schoolSearch}
                                    onChange={(e) => setSchoolSearch(e.target.value)}
                                    icon={<Search className="h-4 w-4" />}
                                />
                            </div>

                            {/* School List */}
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {filteredAvailableSchools.map((school) => (
                                    <button
                                        key={school.id}
                                        onClick={() => setSelectedSchool(school.id)}
                                        className={cn(
                                            "w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                                            selectedSchool === school.id
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-slate-200 hover:border-blue-300"
                                        )}
                                    >
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100">
                                            <GraduationCap className="h-6 w-6 text-violet-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900">{school.name}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                <p className="text-sm text-slate-500 truncate">{school.address}</p>
                                            </div>
                                        </div>
                                        {selectedSchool === school.id && (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Category Selection */}
                            {selectedSchool && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        Select product categories you want to sell
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Books', 'Notebooks', 'Stationery', 'Uniforms', 'Bags', 'Art Supplies'].map(
                                            (category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => toggleCategory(category)}
                                                    className={cn(
                                                        "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                                                        selectedCategories.includes(category)
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"
                                                    )}
                                                >
                                                    {selectedCategories.includes(category) && (
                                                        <Check className="h-3.5 w-3.5 inline-block mr-1" />
                                                    )}
                                                    {category}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    disabled={!selectedSchool || selectedCategories.length === 0}
                                    onClick={() => {
                                        setShowRequestModal(false);
                                        setSelectedSchool(null);
                                        setSelectedCategories([]);
                                    }}
                                >
                                    Submit Request
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
