import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockInventoryItems } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
    Package,
    AlertTriangle,
    XCircle,
    Lightbulb,
    Search,
    ChevronDown,
    RefreshCw,
    TrendingDown,
} from 'lucide-react';

const healthCards = [
    {
        id: 'all',
        label: 'All Inventory',
        icon: <Package className="h-6 w-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
    },
    {
        id: 'low_stock',
        label: 'Low Stock',
        icon: <AlertTriangle className="h-6 w-6" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
    },
    {
        id: 'out_of_stock',
        label: 'Out of Stock',
        icon: <XCircle className="h-6 w-6" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    {
        id: 'recommendations',
        label: 'Recommendations',
        icon: <Lightbulb className="h-6 w-6" />,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
    },
];

export default function InventoryHealthPage() {
    const [selectedFilter, setSelectedFilter] = useState('out_of_stock');
    const [searchQuery, setSearchQuery] = useState('');
    const [stockUpdates, setStockUpdates] = useState({});

    const getFilteredItems = () => {
        let items = mockInventoryItems;

        if (selectedFilter === 'low_stock') {
            items = items.filter(item => item.stockStatus === 'low_stock');
        } else if (selectedFilter === 'out_of_stock') {
            items = items.filter(item => item.stockStatus === 'out_of_stock');
        } else if (selectedFilter === 'recommendations') {
            items = items.filter(item => item.salesLossPotential > 0);
        }

        if (searchQuery) {
            items = items.filter(
                item =>
                    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return items;
    };

    const getCounts = () => ({
        all: mockInventoryItems.length,
        low_stock: mockInventoryItems.filter(i => i.stockStatus === 'low_stock').length,
        out_of_stock: mockInventoryItems.filter(i => i.stockStatus === 'out_of_stock').length,
        recommendations: mockInventoryItems.filter(i => i.salesLossPotential > 0).length,
    });

    const counts = getCounts();
    const filteredItems = getFilteredItems();

    const handleStockChange = (itemId, value) => {
        const numValue = parseInt(value) || 0;
        setStockUpdates({ ...stockUpdates, [itemId]: numValue });
    };

    const getStockBadge = (status) => {
        switch (status) {
            case 'in_stock':
                return <Badge variant="live">In Stock</Badge>;
            case 'low_stock':
                return <Badge variant="pending">Low Stock</Badge>;
            case 'out_of_stock':
                return <Badge variant="rejected">Out of Stock</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Health</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor and manage your stock levels
                    </p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Sync Inventory
                </Button>
            </div>

            {/* Health Status Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {healthCards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => setSelectedFilter(card.id)}
                        className={cn(
                            "relative flex flex-col rounded-xl border-2 p-5 text-left transition-all hover:shadow-md",
                            selectedFilter === card.id
                                ? `${card.bgColor} ${card.borderColor} shadow-md`
                                : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                    >
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg mb-3",
                            selectedFilter === card.id ? card.bgColor : "bg-slate-100",
                            selectedFilter === card.id ? card.color : "text-slate-400"
                        )}>
                            {card.icon}
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            {counts[card.id]} <span className="text-sm font-normal text-slate-500">SKUs</span>
                        </span>
                        <span className={cn(
                            "text-sm font-medium mt-1",
                            selectedFilter === card.id ? card.color : "text-slate-600"
                        )}>
                            {card.label}
                        </span>
                        {selectedFilter === card.id && (
                            <div className={cn(
                                "absolute top-3 right-3 h-3 w-3 rounded-full",
                                card.id === 'low_stock' ? "bg-amber-500" :
                                    card.id === 'out_of_stock' ? "bg-red-500" :
                                        card.id === 'recommendations' ? "bg-violet-500" : "bg-blue-500"
                            )} />
                        )}
                    </button>
                ))}
            </div>

            {/* Search and Bulk Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search by product name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-5 w-5" />}
                    />
                </div>
                <div className="relative">
                    <Button variant="outline">
                        Bulk Stock Update
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stock Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Product Info
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    SKU ID
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                    Stock Count
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                    Sales Loss Potential
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="transition-colors hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                <Package className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-slate-900">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Last updated: {new Date(item.lastUpdated).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                                            {item.sku}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                min="0"
                                                className={cn(
                                                    "w-24 rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors",
                                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                    item.stockStatus === 'out_of_stock'
                                                        ? "border-red-300 bg-red-50 text-red-700"
                                                        : item.stockStatus === 'low_stock'
                                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                                            : "border-slate-300 bg-white text-slate-900"
                                                )}
                                                value={stockUpdates[item.id] ?? item.stockCount}
                                                onChange={(e) => handleStockChange(item.id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStockBadge(item.stockStatus)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.salesLossPotential > 0 ? (
                                            <div className="flex items-center justify-end gap-2 text-red-600">
                                                <TrendingDown className="h-4 w-4" />
                                                <span className="font-semibold">
                                                    ₹{item.salesLossPotential.toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div className="py-12 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">No inventory items found</p>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span>Showing {filteredItems.length} of {mockInventoryItems.length} items</span>
                {Object.keys(stockUpdates).length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-600 font-medium">
                            {Object.keys(stockUpdates).length} unsaved changes
                        </span>
                        <Button size="sm">Save Changes</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
