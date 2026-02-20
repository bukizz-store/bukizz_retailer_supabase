import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { productService } from '@/services/productService';
import { useWarehouse } from '@/context/WarehouseContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import {
    Package,
    AlertTriangle,
    XCircle,
    Lightbulb,
    Search,
    RefreshCw,
    Loader2,
    Minus,
    Plus,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

// ── Thresholds ──
const LOW_STOCK_THRESHOLD = 10;

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
        id: 'needs_restock',
        label: 'Needs Restock',
        icon: <Lightbulb className="h-6 w-6" />,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
    },
];

// ── Helpers ──

function buildVariantLabel(variant) {
    const parts = [variant.optionValue1, variant.optionValue2, variant.optionValue3].filter(Boolean);
    return parts.length > 0 ? parts.join(' / ') : '';
}

function deriveStockStatus(stock) {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
}

/** Derive worst (most critical) stock status among an array of statuses. */
function worstStatus(statuses) {
    if (statuses.includes('out_of_stock')) return 'out_of_stock';
    if (statuses.includes('low_stock')) return 'low_stock';
    return 'in_stock';
}

/** Group products → one group per product, each with its variants array. */
function groupByProduct(products) {
    return products.map((product) => {
        const rawVariants = product.variants || [];
        const variants = rawVariants.length > 0
            ? rawVariants.map((v) => ({
                variantId: v.id,
                isVariant: true,
                variantLabel: buildVariantLabel(v),
                sku: v.sku || product.sku,
                stock: v.stock ?? 0,
                price: v.price ?? product.basePrice ?? 0,
            }))
            : [{
                variantId: null,
                isVariant: false,
                variantLabel: 'No variants',
                sku: product.sku,
                stock: product.stock ?? 0,
                price: product.basePrice ?? 0,
            }];

        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
        const status = worstStatus(variants.map((v) => deriveStockStatus(v.stock)));

        return {
            productId: product.id,
            productName: product.title,
            sku: product.sku,
            variants,
            totalStock,
            status,
            hasVariants: rawVariants.length > 0,
        };
    });
}

export default function InventoryHealthPage() {
    const { activeWarehouse } = useWarehouse();
    const { toast } = useToast();

    // ── Data state ──
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ── Filter / search state ──
    const [selectedFilter, setSelectedFilter] = useState('out_of_stock');
    const [searchQuery, setSearchQuery] = useState('');

    // ── Expand / collapse state: { [productId]: boolean } ──
    const [expandedProducts, setExpandedProducts] = useState({});

    // ── Inline stock edits: { [variantId]: newValue (number) } ──
    const [stockEdits, setStockEdits] = useState({});
    const [saving, setSaving] = useState(false);

    // ── Fetch all products (we load a large page to get the full picture) ──
    const fetchAllProducts = useCallback(async (isRefresh = false) => {
        if (!activeWarehouse?.id) return;

        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const response = await productService.getProductsByWarehouseId({
                warehouseId: activeWarehouse.id,
                page: 1,
                limit: 100, // server max is 100
            });

            if (response.success) {
                const products = response.data.products || [];
                console.log('[InventoryHealth] raw products sample:', JSON.stringify(products.slice(0, 2).map(p => ({
                    id: p.id,
                    title: p.title,
                    stock: p.stock,
                    variants: (p.variants || []).map(v => ({ id: v.id, sku: v.sku, stock: v.stock })),
                })), null, 2));
                setAllProducts(products);
                setStockEdits({}); // clear pending edits on fresh fetch
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            toast({
                title: 'Failed to load inventory',
                description: error.response?.data?.error || 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeWarehouse]);

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    // ── Derived product groups ──
    const allGroups = useMemo(() => groupByProduct(allProducts), [allProducts]);

    // ── Flat variant count for SKU-level stats ──
    const allVariants = useMemo(() => allGroups.flatMap(g => g.variants), [allGroups]);

    // ── Counts (variant / SKU level) ──
    const counts = useMemo(() => ({
        all: allVariants.length,
        low_stock: allVariants.filter(v => deriveStockStatus(v.stock) === 'low_stock').length,
        out_of_stock: allVariants.filter(v => deriveStockStatus(v.stock) === 'out_of_stock').length,
        needs_restock: allVariants.filter(v => deriveStockStatus(v.stock) !== 'in_stock').length,
    }), [allVariants]);

    // ── Filtered groups ──
    const filteredGroups = useMemo(() => {
        let groups = allGroups;

        // Filter: show a product group if ANY of its variants match the filter
        if (selectedFilter === 'low_stock') {
            groups = groups.filter(g => g.variants.some(v => deriveStockStatus(v.stock) === 'low_stock'));
        } else if (selectedFilter === 'out_of_stock') {
            groups = groups.filter(g => g.variants.some(v => deriveStockStatus(v.stock) === 'out_of_stock'));
        } else if (selectedFilter === 'needs_restock') {
            groups = groups.filter(g => g.variants.some(v => deriveStockStatus(v.stock) !== 'in_stock'));
        }

        // Search: match against product name, product sku, or any variant label/sku
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            groups = groups.filter(
                g =>
                    g.productName.toLowerCase().includes(q) ||
                    g.sku?.toLowerCase().includes(q) ||
                    g.variants.some(
                        v =>
                            v.sku?.toLowerCase().includes(q) ||
                            v.variantLabel.toLowerCase().includes(q)
                    )
            );
        }

        return groups;
    }, [allGroups, selectedFilter, searchQuery]);

    // ── Toggle expand / collapse for a product ──
    const toggleExpand = (productId) => {
        setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    // ── Filtered variant count (for footer) ──
    const filteredVariantCount = useMemo(
        () => filteredGroups.reduce((sum, g) => sum + g.variants.length, 0),
        [filteredGroups]
    );

    // ── Inline stock edit handlers ──
    const handleStockEdit = (variantId, value) => {
        if (value === '' || /^\d+$/.test(value)) {
            setStockEdits(prev => ({ ...prev, [variantId]: value === '' ? '' : parseInt(value, 10) }));
        }
    };

    const quickAdjust = (variantId, currentStock, delta) => {
        const current = stockEdits[variantId] ?? currentStock;
        const newVal = Math.max(0, (typeof current === 'number' ? current : parseInt(current, 10) || 0) + delta);
        setStockEdits(prev => ({ ...prev, [variantId]: newVal }));
    };

    // Determine which rows have been edited
    const dirtyEntries = useMemo(() => {
        return Object.entries(stockEdits)
            .filter(([variantId, value]) => {
                const variant = allVariants.find(v => v.variantId === variantId);
                return variant && variant.isVariant && value !== '' && value !== variant.stock;
            })
            .map(([variantId, value]) => ({ variantId, quantity: typeof value === 'number' ? value : parseInt(value, 10) }));
    }, [stockEdits, allVariants]);

    // ── Save changes ──
    const handleSaveChanges = async () => {
        if (dirtyEntries.length === 0) return;

        console.log('[InventoryHealth] saving dirtyEntries:', JSON.stringify(dirtyEntries, null, 2));

        setSaving(true);
        try {
            if (dirtyEntries.length === 1) {
                const entry = dirtyEntries[0];
                await productService.updateVariantStock(entry.variantId, {
                    quantity: entry.quantity,
                    operation: 'set',
                });
            } else {
                await productService.bulkUpdateVariantStock(
                    dirtyEntries.map(e => ({
                        variantId: e.variantId,
                        quantity: e.quantity,
                        operation: 'set',
                    }))
                );
            }

            toast({
                title: 'Stock updated',
                description: `Successfully updated ${dirtyEntries.length} variant${dirtyEntries.length > 1 ? 's' : ''}.`,
                variant: 'success',
            });

            // Refresh data
            await fetchAllProducts();
        } catch (error) {
            console.error('Stock update failed:', error);
            toast({
                title: 'Stock update failed',
                description: error.response?.data?.error || 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    // ── Badge helper ──
    const getStockBadge = (stock) => {
        const status = deriveStockStatus(stock);
        switch (status) {
            case 'in_stock':
                return <Badge variant="live" dot>In Stock</Badge>;
            case 'low_stock':
                return <Badge variant="warning" dot>Low Stock</Badge>;
            case 'out_of_stock':
                return <Badge variant="rejected" dot>Out of Stock</Badge>;
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
                        Monitor and manage stock levels for{' '}
                        {activeWarehouse?.name || 'Loading...'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => fetchAllProducts(true)}
                    loading={refreshing}
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
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
                            {loading ? '—' : counts[card.id]}{' '}
                            <span className="text-sm font-normal text-slate-500">SKUs</span>
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
                                        card.id === 'needs_restock' ? "bg-violet-500" : "bg-blue-500"
                            )} />
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search by product name or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-5 w-5" />}
                    />
                </div>
            </div>

            {/* Stock Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Product / Variant
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    SKU
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                    Current Stock
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                                    New Stock
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    Status
                                </th>
                                <th className="hidden px-6 py-4 text-right text-sm font-semibold text-slate-900 md:table-cell">
                                    Price
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                                            <p>Loading inventory data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                        <p className="font-medium">No inventory items found</p>
                                        <p className="text-xs mt-1">
                                            {selectedFilter !== 'all'
                                                ? 'Try selecting a different filter above.'
                                                : 'Your warehouse has no products yet.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map((group) => {
                                    const isExpanded = !!expandedProducts[group.productId];
                                    const hasMultipleVariants = group.hasVariants && group.variants.length > 1;
                                    const canExpand = group.hasVariants;

                                    return (
                                        <React.Fragment key={group.productId}>
                                            {/* ── Product Header Row ── */}
                                            <tr
                                                className={cn(
                                                    "transition-colors",
                                                    canExpand ? "cursor-pointer hover:bg-slate-100" : "hover:bg-slate-50",
                                                    isExpanded && "bg-slate-50"
                                                )}
                                                onClick={() => canExpand && toggleExpand(group.productId)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Chevron toggle */}
                                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                                                            {canExpand ? (
                                                                isExpanded
                                                                    ? <ChevronDown className="h-4 w-4 text-slate-500 transition-transform" />
                                                                    : <ChevronRight className="h-4 w-4 text-slate-400 transition-transform" />
                                                            ) : (
                                                                <span className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                            <Package className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-900">
                                                                {group.productName}
                                                            </p>
                                                            {canExpand && (
                                                                <p className="text-xs text-slate-500">
                                                                    {group.variants.length} variant{group.variants.length > 1 ? 's' : ''}
                                                                </p>
                                                            )}
                                                            {!group.hasVariants && (
                                                                <p className="text-xs text-slate-400">No variants</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                                                        {group.sku}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={cn(
                                                        "text-sm font-semibold",
                                                        group.status === 'out_of_stock' ? "text-red-600" :
                                                            group.status === 'low_stock' ? "text-amber-600" : "text-slate-900"
                                                    )}>
                                                        {group.totalStock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {/* Stock editing is at variant level — show dash on product row */}
                                                    {group.hasVariants ? (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStockBadge(group.totalStock)}
                                                </td>
                                                <td className="hidden px-6 py-4 text-right md:table-cell">
                                                    {/* Price range or single price */}
                                                    {(() => {
                                                        const prices = group.variants.map(v => v.price).filter(Boolean);
                                                        if (prices.length === 0) return <span className="text-slate-400">—</span>;
                                                        const min = Math.min(...prices);
                                                        const max = Math.max(...prices);
                                                        return (
                                                            <span className="font-medium text-slate-900">
                                                                {min === max
                                                                    ? `₹${min.toLocaleString()}`
                                                                    : `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>

                                            {/* ── Variant Sub-Rows (shown when expanded) ── */}
                                            {isExpanded && group.hasVariants && group.variants.map((variant) => {
                                                const editedValue = stockEdits[variant.variantId];
                                                const displayStock = editedValue ?? variant.stock;
                                                const isDirty = editedValue !== undefined && editedValue !== '' && editedValue !== variant.stock;
                                                const status = deriveStockStatus(variant.stock);

                                                return (
                                                    <tr
                                                        key={variant.variantId}
                                                        className={cn(
                                                            "transition-colors hover:bg-blue-50/30",
                                                            isDirty && "bg-blue-50/40",
                                                            "bg-slate-50/50"
                                                        )}
                                                    >
                                                        <td className="py-3 pr-6 pl-10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 flex-shrink-0 flex justify-center">
                                                                    <div className="h-5 w-px bg-slate-300" />
                                                                </div>
                                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-50 border border-blue-100">
                                                                    <Package className="h-3.5 w-3.5 text-blue-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm text-slate-700">
                                                                        {variant.variantLabel || 'Default'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                                {variant.sku}
                                                            </code>
                                                        </td>
                                                        <td className="px-6 py-3 text-center">
                                                            <span className={cn(
                                                                "text-sm font-semibold",
                                                                status === 'out_of_stock' ? "text-red-600" :
                                                                    status === 'low_stock' ? "text-amber-600" : "text-slate-900"
                                                            )}>
                                                                {variant.stock}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            {variant.isVariant ? (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); quickAdjust(variant.variantId, variant.stock, -1); }}
                                                                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                                                                        disabled={displayStock <= 0}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        className={cn(
                                                                            "w-16 rounded-lg border px-2 py-1 text-center text-sm font-medium transition-colors",
                                                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                                                                            isDirty
                                                                                ? "border-blue-400 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                                                                                : status === 'out_of_stock'
                                                                                    ? "border-red-300 bg-red-50 text-red-700"
                                                                                    : status === 'low_stock'
                                                                                        ? "border-amber-300 bg-amber-50 text-amber-700"
                                                                                        : "border-slate-300 bg-white text-slate-900"
                                                                        )}
                                                                        value={editedValue ?? variant.stock}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={(e) => handleStockEdit(variant.variantId, e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); quickAdjust(variant.variantId, variant.stock, 1); }}
                                                                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-xs text-slate-400">N/A</p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            {getStockBadge(variant.stock)}
                                                        </td>
                                                        <td className="hidden px-6 py-3 text-right md:table-cell">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                ₹{variant.price?.toLocaleString()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Footer with Save */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span>
                    Showing {filteredGroups.length} product{filteredGroups.length !== 1 ? 's' : ''}{' '}
                    ({filteredVariantCount} of {allVariants.length} SKUs)
                </span>
                {dirtyEntries.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-blue-600 font-medium">
                            {dirtyEntries.length} unsaved change{dirtyEntries.length > 1 ? 's' : ''}
                        </span>
                        <Button
                            size="sm"
                            onClick={handleSaveChanges}
                            loading={saving}
                        >
                            {dirtyEntries.length > 1 ? 'Bulk Update Stock' : 'Update Stock'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStockEdits({})}
                            disabled={saving}
                        >
                            Discard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
