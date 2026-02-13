import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockGeneralProducts } from '@/data/mockData';
import {
    Plus,
    Search,
    Filter,
    Package,
    Edit,
    Trash2,
    Eye,
} from 'lucide-react';

const categories = [
    { id: 'all', label: 'All Products', icon: '📦' },
    { id: 'bags', label: 'Bags', icon: '🎒' },
    { id: 'bottles', label: 'Bottles', icon: '🍶' },
    { id: 'stationery', label: 'Stationery', icon: '✏️' },
    { id: 'art_supplies', label: 'Art Supplies', icon: '🎨' },
    { id: 'general_books', label: 'General Books', icon: '📚' },
];

export default function GeneralStorePage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = mockGeneralProducts.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Page Header with Add Product Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">General Store</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your product catalog and inventory</p>
                </div>
                <Link
                    to="/dashboard/inventory/general/add"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${selectedCategory === category.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        <span>{category.icon}</span>
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-5 w-5" />}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Products Table */}
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
                            {filteredProducts.map((product) => (
                                <tr
                                    key={product.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                <Package className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-slate-900">
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
                                            {product.category.replace('_', ' ')}
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
                                        <Badge variant="live" dot>Live</Badge>
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

                {filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">No products found</p>
                        <Button variant="outline" className="mt-4">
                            <Plus className="h-4 w-4" />
                            Add your first product
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="flex flex-col items-start justify-between gap-4 text-sm text-slate-500 sm:flex-row sm:items-center">
                <span>Showing {filteredProducts.length} of {mockGeneralProducts.length} products</span>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>All products are Live (auto-approved)</span>
                </div>
            </div>
        </div>
    );
}
