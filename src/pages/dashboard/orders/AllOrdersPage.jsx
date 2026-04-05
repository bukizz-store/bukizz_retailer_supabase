import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import useOrderStore from '@/store/orderStore';
import { useWarehouse } from '@/context/WarehouseContext';
import { orderService } from '@/services/orderService';
import {
    Search, Download, Package, Truck,
    Clock, CheckCircle, GraduationCap, MapPin,
    Loader2, AlertCircle, RefreshCw, Printer, CheckCheck,
    ShoppingBag, RotateCcw, XCircle, Calendar, X,
    Filter, Check, RotateCw, ChevronDown, ChevronUp,
    School, User, ShoppingCart,
} from 'lucide-react';

// ── localStorage key ──
const LS_FILTERS_KEY = 'allOrdersAdvancedFilters';

function loadFiltersFromStorage() {
    try {
        const raw = localStorage.getItem(LS_FILTERS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveFiltersToStorage(filters) {
    try {
        localStorage.setItem(LS_FILTERS_KEY, JSON.stringify(filters));
    } catch { /* ignore */ }
}

function clearFiltersFromStorage() {
    try { localStorage.removeItem(LS_FILTERS_KEY); } catch { /* ignore */ }
}

// ── Status config ──
const statusCards = [
    { id: 'all', label: 'All Orders', icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'processed', label: 'Processed', icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { id: 'shipped', label: 'Shipped', icon: <Truck className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: <ShoppingBag className="h-5 w-5" />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { id: 'delivered', label: 'Delivered', icon: <CheckCheck className="h-5 w-5" />, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-5 w-5" />, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { id: 'refunded', label: 'Refunded', icon: <RotateCcw className="h-5 w-5" />, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
];

const statusLabelMap = {
    initialized: 'New', processed: 'Processed', shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
    cancelled: 'Cancelled', refunded: 'Refunded',
};

const statusBadgeVariant = {
    initialized: 'initialized', processed: 'processing', shipped: 'shipped',
    out_for_delivery: 'out_for_delivery', delivered: 'delivered',
    cancelled: 'cancelled', refunded: 'refunded',
};

function shortenOrderId(order) {
    if (order.orderNumber) return order.orderNumber;
    const id = order.id || '';
    if (id.length <= 12) return id;
    return `#${id.replace(/-/g, '').slice(-8).toUpperCase()}`;
}

const STATUS_PRIORITY = ['initialized', 'processed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

function getOrderStatus(order) {
    const items = order.items || [];
    if (items.length === 0) return order.status || 'initialized';
    let minIndex = STATUS_PRIORITY.length;
    for (const item of items) {
        const idx = STATUS_PRIORITY.indexOf(item.status);
        if (idx !== -1 && idx < minIndex) minIndex = idx;
    }
    return minIndex < STATUS_PRIORITY.length ? STATUS_PRIORITY[minIndex] : (order.status || 'initialized');
}

// ── Multi-select dropdown component ──
function MultiSelect({ options, selected, onChange, placeholder, disabled, renderOption }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleOption = (val) => {
        if (selected.includes(val)) onChange(selected.filter(v => v !== val));
        else onChange([...selected, val]);
    };

    const displayText = selected.length === 0 ? placeholder : `${selected.length} selected`;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center justify-between w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-left transition",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-400 cursor-pointer",
                    open && "border-blue-400 ring-1 ring-blue-100"
                )}
            >
                <span className={selected.length === 0 ? "text-slate-400" : "text-slate-900"}>{displayText}</span>
                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full max-h-52 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {options.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-slate-400">No options</p>
                    ) : (
                        options.map((opt) => {
                            const isSelected = selected.includes(opt.value);
                            return (
                                <button key={opt.value} type="button"
                                    onClick={() => toggleOption(opt.value)}
                                    className={cn(
                                        "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition",
                                        isSelected && "bg-blue-50"
                                    )}
                                >
                                    <span className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded border",
                                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </span>
                                    {renderOption ? renderOption(opt) : <span>{opt.label}</span>}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AllOrdersPage() {
    const {
        orders, totalCount, isLoading, error,
        statusCounts,
        fetchFilteredOrders, clearError,
    } = useOrderStore();

    const { activeWarehouse } = useWarehouse();
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);
    const [localSearch, setLocalSearch] = useState('');

    // ── URL-based state (immediate triggers) ──
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '50';
    const limit = limitParam === 'all' ? 'all' : parseInt(limitParam);
    const statusFilter = searchParams.get('status') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const warehouseId = activeWarehouse?.id;

    // ── Advanced filters (localStorage, apply-on-click) ──
    const [showFilters, setShowFilters] = useState(false);
    const [productType, setProductType] = useState('all');
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // "Applied" state — what's actually sent to the API
    const [appliedFilters, setAppliedFilters] = useState({
        productType: 'all', schoolIds: [], productIds: [], studentNames: [],
    });

    // Filter option data
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    // ── Restore from localStorage on mount ──
    useEffect(() => {
        const saved = loadFiltersFromStorage();
        if (saved) {
            setProductType(saved.productType || 'all');
            setSelectedSchools(saved.schoolIds || []);
            setSelectedProducts(saved.productIds || []);
            setSelectedStudents(saved.studentNames || []);
            setAppliedFilters({
                productType: saved.productType || 'all',
                schoolIds: saved.schoolIds || [],
                productIds: saved.productIds || [],
                studentNames: saved.studentNames || [],
            });
            if (saved.productType !== 'all' || (saved.schoolIds?.length || 0) > 0 || (saved.productIds?.length || 0) > 0 || (saved.studentNames?.length || 0) > 0) {
                setShowFilters(true);
            }
        }
    }, []);

    // ── Load filter options when panel opens ──
    useEffect(() => {
        if (!showFilters || !warehouseId) return;
        setOptionsLoading(true);
        Promise.all([
            orderService.getFilterSchools(warehouseId).then(r => setSchoolOptions(r?.data || [])),
            orderService.getFilterProducts(warehouseId, selectedSchools).then(r => setProductOptions(r?.data || [])),
            orderService.getFilterStudents(warehouseId).then(r => setStudentOptions(r?.data || [])),
        ]).finally(() => setOptionsLoading(false));
    }, [showFilters, warehouseId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cascade: when schools change, reload products ──
    useEffect(() => {
        if (!warehouseId) return;
        orderService.getFilterProducts(warehouseId, selectedSchools)
            .then(r => {
                setProductOptions(r?.data || []);
                // Remove product selections no longer valid
                const validIds = new Set((r?.data || []).map(p => p.id));
                setSelectedProducts(prev => prev.filter(id => validIds.has(id)));
            })
            .catch(() => {});
    }, [selectedSchools, warehouseId]);

    // ── URL param helpers (immediate triggers) ──
    const setPage = (p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; });
    const setLimit = (l) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('limit', String(l)); n.set('page', '1'); return n; });
    const setStatusFilter = (s) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('status', s); n.set('page', '1'); return n; });
    const setDateFilter = (s, e) => setSearchParams(prev => {
        const n = new URLSearchParams(prev);
        if (s) n.set('startDate', s); else n.delete('startDate');
        if (e) n.set('endDate', e); else n.delete('endDate');
        n.set('page', '1');
        return n;
    });
    const clearDateFilter = () => setSearchParams(prev => {
        const n = new URLSearchParams(prev);
        n.delete('startDate'); n.delete('endDate'); n.set('page', '1');
        return n;
    });

    // ── Build POST body & fetch ──
    const buildPostBody = useCallback(() => ({
        page: page,
        limit: limit === 'all' ? 'all' : parseInt(limit),
        status: statusFilter === 'all' ? 'all' : statusFilter,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
        productType: appliedFilters.productType,
        schoolIds: appliedFilters.schoolIds,
        productIds: appliedFilters.productIds,
        studentNames: appliedFilters.studentNames,
    }), [page, limit, statusFilter, searchQuery, startDate, endDate, appliedFilters]);

    useEffect(() => {
        const body = buildPostBody();
        fetchFilteredOrders(warehouseId, body);
    }, [page, limit, warehouseId, startDate, endDate, statusFilter, searchQuery, appliedFilters, buildPostBody, fetchFilteredOrders]);

    // ── Search handler (immediate, debounced) ──
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setLocalSearch(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setSearchParams(prev => {
                const n = new URLSearchParams(prev);
                if (value) n.set('search', value); else n.delete('search');
                n.set('page', '1');
                return n;
            });
        }, 400);
    }, [setSearchParams]);

    // ── Date filter handlers (immediate) ──
    const handleStartDateChange = useCallback((e) => setDateFilter(e.target.value, endDate), [endDate, setDateFilter]);
    const handleEndDateChange = useCallback((e) => setDateFilter(startDate, e.target.value), [startDate, setDateFilter]);

    useEffect(() => () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); }, []);
    useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

    // ── Apply / Reset advanced filters ──
    const handleApplyFilters = () => {
        const filters = {
            productType,
            schoolIds: selectedSchools,
            productIds: selectedProducts,
            studentNames: selectedStudents,
        };
        setAppliedFilters(filters);
        saveFiltersToStorage(filters);
        setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', '1'); return n; });
    };

    const handleResetFilters = () => {
        setProductType('all');
        setSelectedSchools([]);
        setSelectedProducts([]);
        setSelectedStudents([]);
        const cleared = { productType: 'all', schoolIds: [], productIds: [], studentNames: [] };
        setAppliedFilters(cleared);
        clearFiltersFromStorage();
        setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', '1'); return n; });
    };

    const hasActiveFilters = appliedFilters.productType !== 'all' || appliedFilters.schoolIds.length > 0 ||
        appliedFilters.productIds.length > 0 || appliedFilters.studentNames.length > 0;

    const hasUnappliedChanges = productType !== appliedFilters.productType ||
        JSON.stringify(selectedSchools) !== JSON.stringify(appliedFilters.schoolIds) ||
        JSON.stringify(selectedProducts) !== JSON.stringify(appliedFilters.productIds) ||
        JSON.stringify(selectedStudents) !== JSON.stringify(appliedFilters.studentNames);

    // ── Status counts from API ──
    const counts = {
        all: statusCounts?.all ?? 0,
        processed: statusCounts?.processed ?? 0,
        shipped: statusCounts?.shipped ?? 0,
        out_for_delivery: statusCounts?.out_for_delivery ?? 0,
        delivered: statusCounts?.delivered ?? 0,
        cancelled: statusCounts?.cancelled ?? 0,
        refunded: statusCounts?.refunded ?? 0,
    };

    const displayedOrders = orders;
    const numericLimit = limit === 'all' ? totalCount || 1 : parseInt(limit);
    const totalPages = Math.ceil(totalCount / numericLimit) || 1;

    // ── Filter options for MultiSelect ──
    const schoolOpts = useMemo(() => schoolOptions.map(s => ({ value: s.id, label: s.name })), [schoolOptions]);
    const productOpts = useMemo(() => productOptions.map(p => ({ value: p.id, label: p.title })), [productOptions]);
    const studentOpts = useMemo(() => studentOptions.map(s => ({ value: s.studentName, label: s.studentName, subtext: s.userName })), [studentOptions]);

    const showSchoolProductFilters = productType !== 'general';

// (Import added at top by next replacement)
    const exportToExcel = useCallback(() => {
        if (!displayedOrders || displayedOrders.length === 0) {
            alert('No data to export.');
            return;
        }

        const headers = [
            'Dispatch ID', 'Order ID', 'User Name', 'Student Name', 
            'Product Name', 'SKU', 'Amount', 'Quantity', 'Status', 
            'Payment Method', 'Payment Status', 'Address', 'City', 'State', 'Postal Code'
        ];

        const dataArray = [];
        dataArray.push(headers);

        displayedOrders.forEach(order => {
            const userName = order.shippingAddress?.recipientName || order.contactEmail || '—';
            const studentName = order.shippingAddress?.studentName || '—';
            const amount = order.items?.[0]?.unitPrice || order.totalAmount || 0;
            const status = getOrderStatus(order);
            const statusLabel = statusLabelMap[status] || status;
            
            const paymentMethod = order.paymentMethod?.toUpperCase() || '—';
            const paymentStatus = order.paymentStatus || '—';
            
            const addr = order.shippingAddress || {};
            const addressLines = [addr.line1, addr.line2].filter(Boolean).join(', ') || '—';
            const city = addr.city || '—';
            const state = addr.state || '—';
            const postalCode = addr.postalCode || '—';
            
            const items = order.items && order.items.length > 0 ? order.items : [{}];
            
            items.forEach(item => {
                const productName = item.schoolName ? `${item.title || item.productSnapshot?.name} - ${item.schoolName}` : (item.title || item.productSnapshot?.name || '—');
                const sku = item.variant?.sku || '—';
                const quantity = item.quantity || 1;
                const dispatchId = item.dispatchId || '—';
                const orderIdStr = order.orderNumber || order.id || '—';

                // Ensure data types are native to let XLSX library handle typing (numbers as numbers)
                dataArray.push([
                    dispatchId, orderIdStr, userName, studentName, 
                    productName, sku, Number(amount) || 0, Number(quantity) || 1, statusLabel, 
                    paymentMethod, paymentStatus, addressLines, city, state, postalCode
                ]);
            });
        });

        // Use dynamically imported XLSX (assuming it's installed or available in global context)
        import('xlsx').then((XLSX) => {
            const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
            
            // Adjust column widths for better readability
            const wscols = [
                { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
                { wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
            ];
            worksheet['!cols'] = wscols;

            const currentTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
            XLSX.writeFile(workbook, `Orders_Export_${currentTimestamp}.xlsx`);
        }).catch(err => {
            console.error("XLSX import failed:", err);
            alert("Failed to export as XLSX. Please ensure the 'xlsx' package is installed.");
        });
    }, [displayedOrders]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        View all orders for{' '}
                        <span className="font-medium text-slate-700">{activeWarehouse?.name || 'your warehouse'}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(hasActiveFilters && "border-blue-400 text-blue-600")}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">!</span>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { const body = buildPostBody(); fetchFilteredOrders(warehouseId, body); }} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToExcel} disabled={isLoading || displayedOrders.length === 0}>
                        <Download className="h-4 w-4" />Export
                    </Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <Button variant="ghost" size="sm" onClick={clearError} className="text-red-600 hover:text-red-700">Dismiss</Button>
                </div>
            )}

            {/* ── Advanced Filter Panel ── */}
            {showFilters && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Advanced Filters
                        </h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleResetFilters}
                                className="text-slate-600 hover:text-red-600" disabled={!hasActiveFilters && !hasUnappliedChanges}>
                                <RotateCw className="h-4 w-4" /> Reset
                            </Button>
                            <Button size="sm" onClick={handleApplyFilters}
                                className={cn("transition", hasUnappliedChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500")}
                                disabled={!hasUnappliedChanges}>
                                <Check className="h-4 w-4" /> Apply
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Product Type (single select) */}
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Product Type</label>
                            <select
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="school">School</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        {/* School filter (multiselect) — hidden for "general" */}
                        {showSchoolProductFilters && (
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">School</label>
                                <MultiSelect
                                    options={schoolOpts}
                                    selected={selectedSchools}
                                    onChange={setSelectedSchools}
                                    placeholder="All Schools"
                                    disabled={optionsLoading}
                                />
                            </div>
                        )}

                        {/* Product filter (multiselect, cascaded by school) — hidden for "general" */}
                        {showSchoolProductFilters && (
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Product / Class</label>
                                <MultiSelect
                                    options={productOpts}
                                    selected={selectedProducts}
                                    onChange={setSelectedProducts}
                                    placeholder="All Products"
                                    disabled={optionsLoading}
                                />
                            </div>
                        )}

                        {/* Student Name filter (multiselect) */}
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Student Name</label>
                            <MultiSelect
                                options={studentOpts}
                                selected={selectedStudents}
                                onChange={setSelectedStudents}
                                placeholder="All Students"
                                disabled={optionsLoading}
                                renderOption={(opt) => (
                                    <div>
                                        <span className="text-slate-900">{opt.label}</span>
                                        {opt.subtext && <span className="ml-2 text-xs text-slate-400">{opt.subtext}</span>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Active:</span>
                            {appliedFilters.productType !== 'all' && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                    Type: {appliedFilters.productType}
                                </span>
                            )}
                            {appliedFilters.schoolIds.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                    {appliedFilters.schoolIds.length} school(s)
                                </span>
                            )}
                            {appliedFilters.productIds.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                    {appliedFilters.productIds.length} product(s)
                                </span>
                            )}
                            {appliedFilters.studentNames.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                    {appliedFilters.studentNames.length} student(s)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Status Filter Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statusCards.map((card) => (
                    <button key={card.id} onClick={() => setStatusFilter(card.id)}
                        className={cn("relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
                            statusFilter === card.id ? `${card.bgColor} ${card.borderColor} shadow-md` : "bg-white border-slate-200"
                        )}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg",
                            statusFilter === card.id ? card.bgColor : "bg-slate-100",
                            statusFilter === card.id ? card.color : "text-slate-400"
                        )}>{card.icon}</div>
                        <div>
                            <span className="text-2xl font-bold text-slate-900">{isLoading ? '—' : (counts[card.id] ?? 0)}</span>
                            <p className={cn("text-sm font-medium", statusFilter === card.id ? card.color : "text-slate-600")}>{card.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search & Date Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1 max-w-md">
                    <Input placeholder="Search by order ID, dispatch ID, student or user name..."
                        value={localSearch} onChange={handleSearchChange}
                        icon={<Search className="h-5 w-5" />}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input type="date" value={startDate} onChange={handleStartDateChange}
                            className="text-sm border-none outline-none bg-transparent" placeholder="From" />
                        <span className="text-slate-400">to</span>
                        <input type="date" value={endDate} onChange={handleEndDateChange}
                            className="text-sm border-none outline-none bg-transparent" />
                        {(startDate || endDate) && (
                            <button onClick={() => clearDateFilter()} className="ml-1 p-0.5 rounded hover:bg-slate-100" title="Clear date filter">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date &amp; Time</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Student / Customer</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Amount</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Qty</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900" style={{ minWidth: '140px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Loader2 className="mx-auto mb-3 h-8 w-8 text-blue-500 animate-spin" />
                                        <p className="text-sm text-slate-500">Loading orders…</p>
                                    </td>
                                </tr>
                            ) : displayedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-600">No orders found</p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {searchQuery ? 'Try adjusting your search query' : hasActiveFilters ? 'Try changing filter options' : 'Confirmed orders will appear here'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayedOrders.map((order, idx) => (
                                    <AllOrderRow
                                        key={`${order.id}-${order.items?.[0]?.id || idx}`}
                                        order={order}
                                        onViewOrder={() => navigate(`/dashboard/orders/${order.items?.[0]?.id || order.id}`)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <select className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                            value={limitParam} onChange={(e) => setLimit(e.target.value)}>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="150">150</option>
                            <option value="200">200</option>
                            <option value="all">All</option>
                        </select>
                        <span>Items per page</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>Page {page} of {totalPages} · {totalCount} total</span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={page <= 1 || limit === 'all'} onClick={() => setPage(page - 1)}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages || limit === 'all'} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Individual Order Row ───────────────────────────────────────────────────────

function AllOrderRow({ order, onViewOrder }) {
    const shortId = shortenOrderId(order);
    const status = getOrderStatus(order);
    const studentName = order.shippingAddress?.studentName || '—';
    const customerName = order.shippingAddress?.recipientName || order.contactEmail || '—';
    const amount = order.items?.[0]?.unitPrice || order.totalAmount || 0;
    const createdAtDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';
    const createdAtTime = order.createdAt
        ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : '';

    const handleRowClick = (e) => {
        if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
        onViewOrder();
    };

    return (
        <tr className="transition-colors hover:bg-slate-50 cursor-pointer" onClick={handleRowClick}>
            {/* Order ID */}
            <td className="px-6 py-4">
                <p className="font-mono text-sm font-medium text-blue-600 truncate max-w-[120px]" title={order.items[0]?.dispatchId}>{order.items[0]?.dispatchId}</p>
            </td>

            {/* Order Details */}
            <td className="px-6 py-4 w-1/4">
                <div className="flex flex-col gap-1">
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="text-sm">
                            <p className="font-medium text-slate-900 line-clamp-2" title={item.title || item.productSnapshot?.name}>
                                {item.schoolName ? `${item.title || item.productSnapshot?.name} - ${item.schoolName}` : (item.title || item.productSnapshot?.name)}
                            </p>
                            {item.variant?.sku && (
                                <p className="text-xs text-slate-500">SKU: {item.variant.sku}</p>
                            )}
                            {(item.variantDetail || item.productSnapshot?.variantName) && (
                                <p className="text-xs text-slate-500">{item.variantDetail || item.productSnapshot?.variantName}</p>
                            )}
                        </div>
                    ))}
                    {(!order.items || order.items.length === 0) && <span className="text-sm text-slate-400">No details</span>}
                </div>
            </td>

            {/* Date & Time */}
            <td className="px-6 py-4 whitespace-nowrap">
                <p className="text-sm text-slate-900">{createdAtDate}</p>
                <p className="text-xs text-slate-500 mt-0.5">{createdAtTime}</p>
            </td>

            {/* Student / Customer */}
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]" title={studentName}>{studentName}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[180px]" title={customerName}>{customerName}</p>
                </div>
            </td>

            {/* Amount */}
            <td className="px-6 py-4 text-right font-bold text-slate-900">₹{amount.toLocaleString()}</td>

            {/* Qty */}
            <td className="px-6 py-4 text-center">
                <span className="text-sm font-medium text-slate-900">
                    {order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || order.itemCount || 0}
                </span>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <Badge variant={statusBadgeVariant[status] || 'default'} dot>
                    {statusLabelMap[status] || status}
                </Badge>
            </td>
        </tr>
    );
}
