'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockSchools, mockSchoolProducts } from '@/data/mockData';
import { SchoolProductCategory, SchoolProduct } from '@/types';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    LayoutGrid,
    List,
    MapPin,
    BookOpen,
    Shirt,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
} from 'lucide-react';

interface PageProps {
    params: { schoolId: string };
}

// Category configuration
const categories: { id: SchoolProductCategory; label: string; icon: React.ReactNode; emoji: string }[] = [
    { id: 'booksets', label: 'Book Sets', icon: <BookOpen className="h-6 w-6" />, emoji: '📚' },
    { id: 'uniforms', label: 'Uniforms', icon: <Shirt className="h-6 w-6" />, emoji: '👔' },
    { id: 'merchandise', label: 'Merchandise', icon: <Package className="h-6 w-6" />, emoji: '🎒' },
];

// Tabs configuration
type TabId = 'products' | 'add' | 'approvals';
const tabs: { id: TabId; label: string }[] = [
    { id: 'products', label: 'My Products' },
    { id: 'add', label: 'Add New Product' },
    { id: 'approvals', label: 'Track Approval Requests' },
];

export default function SchoolProductManagementPage({ params }: PageProps) {
    const { schoolId } = params;

    const [selectedCategory, setSelectedCategory] = useState<SchoolProductCategory>('booksets');
    const [activeTab, setActiveTab] = useState<TabId>('products');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Get school data
    const school = mockSchools.find(s => s.id === schoolId);

    // Filter products for this school and category
    const schoolProducts = mockSchoolProducts.filter(
        p => p.schoolId === schoolId && p.category === selectedCategory
    );

    // Get pending approvals count
    const pendingCount = mockSchoolProducts.filter(
        p => p.schoolId === schoolId && p.approvalStatus === 'pending'
    ).length;

    if (!school) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900">School not found</h2>
                <p className="text-slate-500 mt-2">The requested school could not be found.</p>
                <Link href="/dashboard/inventory/schools" className="mt-4">
                    <Button variant="outline">
                        <ChevronLeft className="h-4 w-4" />
                        Back to My Schools
                    </Button>
                </Link>
            </div>
        );
    }

    // Status badge helper
    const getStatusBadge = (status: SchoolProduct['approvalStatus']) => {
        switch (status) {
            case 'live':
                return <Badge variant="live" dot>Live</Badge>;
            case 'pending':
                return <Badge variant="warning" dot>Pending</Badge>;
            case 'rejected':
                return <Badge variant="rejected" dot>Rejected</Badge>;
            case 'draft':
                return <Badge variant="default">Draft</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
            {/* ========================================
                1. SCHOOL HERO HEADER
            ======================================== */}
            <div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden">
                {/* Background with gradient overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/20" />
                </div>

                {/* Back button */}
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/dashboard/inventory/schools">
                        <button className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/20">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Schools
                        </button>
                    </Link>
                </div>

                {/* School info - Bottom Left */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                        {school.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-white/80">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm sm:text-base">{school.city}, {school.state}</span>
                    </div>
                </div>

                {/* Info Card - Top Right */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 text-white">
                        <div className="space-y-1.5 text-sm">
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-white/70">Board</span>
                                <span className="font-semibold">{school.board}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-white/70">Type</span>
                                <span className="font-semibold">Private</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-white/70">Status</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-semibold text-emerald-300">Active</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content area with padding restored */}
            <div className="px-4 lg:px-6 space-y-6">
                {/* ========================================
                    2. CATEGORY NAVIGATION
                ======================================== */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category.id;
                        const productCount = mockSchoolProducts.filter(
                            p => p.schoolId === schoolId && p.category === category.id
                        ).length;

                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 transition-all duration-200 ${isActive
                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                    }`}
                            >
                                <span className="text-3xl mb-2">{category.emoji}</span>
                                <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                                    {category.label}
                                </span>
                                <span className={`text-xs mt-1 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {productCount} items
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ========================================
                    3. FUNCTIONAL TABS
                ======================================== */}
                <div className="border-b border-slate-200">
                    <nav className="flex gap-6 overflow-x-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative whitespace-nowrap py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'text-blue-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.id === 'approvals' && pendingCount > 0 && (
                                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                            {pendingCount}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ========================================
                    4. MAIN CONTENT AREA
                ======================================== */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        {/* Header Controls */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Listed Products
                                <span className="ml-2 text-sm font-normal text-slate-500">
                                    ({schoolProducts.length} items)
                                </span>
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* View Toggle */}
                                <div className="flex rounded-lg border border-slate-200 p-1 bg-white">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-md p-2 transition-colors ${viewMode === 'grid'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-md p-2 transition-colors ${viewMode === 'list'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                        title="List View"
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                                {/* Add Product Button */}
                                <Button onClick={() => setActiveTab('add')}>
                                    <Plus className="h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Products Display */}
                        {schoolProducts.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                                <Package className="mx-auto h-12 w-12 text-slate-300" />
                                <p className="mt-4 text-slate-500">No products in this category yet</p>
                                <Button variant="outline" className="mt-4" onClick={() => setActiveTab('add')}>
                                    <Plus className="h-4 w-4" />
                                    Add your first product
                                </Button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* GRID VIEW */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {schoolProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
                                    >
                                        {/* Product Image */}
                                        <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-slate-300" />
                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3">
                                                {getStatusBadge(product.approvalStatus)}
                                            </div>
                                            {/* Class Badge (for booksets) */}
                                            {selectedCategory === 'booksets' && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                                                        Class 10
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Product Details */}
                                        <div className="p-4">
                                            <h3 className="font-medium text-slate-900 truncate" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="text-lg font-bold text-slate-900">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-slate-400 line-through">
                                                    ₹{product.mrp.toLocaleString()}
                                                </span>
                                                <span className="text-xs font-medium text-emerald-600">
                                                    {Math.round((1 - product.price / product.mrp) * 100)}% off
                                                </span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-sm text-slate-500">
                                                    Stock: {product.stockQuantity}
                                                </span>
                                                <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-100 hover:text-blue-700">
                                                    <Edit className="h-3.5 w-3.5 inline mr-1" />
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* LIST VIEW */
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">SKU</th>
                                                <th className="hidden px-6 py-4 text-left text-sm font-semibold text-slate-900 md:table-cell">Category</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Price</th>
                                                <th className="hidden px-6 py-4 text-right text-sm font-semibold text-slate-900 sm:table-cell">Stock</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {schoolProducts.map((product) => (
                                                <tr key={product.id} className="transition-colors hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                                <BookOpen className="h-6 w-6 text-slate-400" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-slate-900 max-w-[200px]">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    MRP: ₹{product.mrp}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                                                            {product.sku}
                                                        </code>
                                                    </td>
                                                    <td className="hidden px-6 py-4 md:table-cell">
                                                        <Badge variant="default" className="capitalize">
                                                            {product.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-semibold text-slate-900">
                                                            ₹{product.price.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-6 py-4 text-right sm:table-cell">
                                                        <span className={`font-medium ${product.stockQuantity < 20
                                                            ? 'text-amber-600'
                                                            : 'text-slate-900'
                                                            }`}>
                                                            {product.stockQuantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(product.approvalStatus)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                        <Plus className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Add New Product</h3>
                        <p className="mt-2 text-slate-500">Product creation form coming soon...</p>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900">Approval Requests</h2>
                        {mockSchoolProducts
                            .filter(p => p.schoolId === schoolId && (p.approvalStatus === 'pending' || p.approvalStatus === 'rejected'))
                            .map((product) => (
                                <div
                                    key={product.id}
                                    className={`flex items-center justify-between rounded-lg border p-4 ${product.approvalStatus === 'rejected'
                                        ? 'border-red-200 bg-red-50'
                                        : 'border-amber-200 bg-amber-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {product.approvalStatus === 'pending' ? (
                                            <Clock className="h-8 w-8 text-amber-500" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-red-500" />
                                        )}
                                        <div>
                                            <p className="font-medium text-slate-900">{product.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {product.approvalStatus === 'pending'
                                                    ? 'Waiting for admin approval'
                                                    : product.rejectionReason}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(product.approvalStatus)}
                                </div>
                            ))}
                        {mockSchoolProducts.filter(p => p.schoolId === schoolId && (p.approvalStatus === 'pending' || p.approvalStatus === 'rejected')).length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                                <CheckCircle className="mx-auto h-12 w-12 text-emerald-300" />
                                <p className="mt-4 text-slate-500">No pending approval requests</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
