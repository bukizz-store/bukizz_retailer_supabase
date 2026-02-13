import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockSchoolDetails, mockSchoolProducts } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    GraduationCap,
    MapPin,
    Package,
    Plus,
    Search,
    Grid,
    List,
    BookOpen,
    Edit,
    Eye,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
} from 'lucide-react';

const schoolCategories = [
    { id: 'all', label: 'All', icon: '📦' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'notebooks', label: 'Notebooks', icon: '📓' },
    { id: 'stationery', label: 'Stationery', icon: '✏️' },
    { id: 'uniforms', label: 'Uniforms', icon: '👔' },
    { id: 'art_supplies', label: 'Art Supplies', icon: '🎨' },
];

export default function SchoolProductManagementPage() {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my_products');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');

    const school = mockSchoolDetails;

    const filteredProducts = mockSchoolProducts.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const tabs = [
        { id: 'my_products', label: 'My Products', count: mockSchoolProducts.length },
        { id: 'add_new', label: 'Add New Product', count: 0 },
        { id: 'track_approvals', label: 'Track Approval Requests', count: 2 },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Navigation */}
            <button
                onClick={() => navigate('/dashboard/inventory/schools')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to My Schools
            </button>

            {/* School Hero Section */}
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-violet-600 to-blue-600 p-8 text-white shadow-lg">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{school.name}</h1>
                            <div className="flex items-center gap-2 mt-2 text-white/80">
                                <MapPin className="h-4 w-4" />
                                <p className="text-sm">{school.address}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {school.approvedCategories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm text-center min-w-[100px]">
                            <p className="text-3xl font-bold">{school.totalProducts}</p>
                            <p className="text-xs text-white/80 mt-1">Products</p>
                        </div>
                        <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm text-center min-w-[100px]">
                            <p className="text-3xl font-bold">{school.totalStudents}</p>
                            <p className="text-xs text-white/80 mt-1">Students</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {schoolCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                            "flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                            selectedCategory === category.id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        <span>{category.icon}</span>
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Functional Tabs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-600 hover:text-slate-900"
                            )}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={cn(
                                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                                    activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'my_products' && (
                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                            className="w-60"
                        />
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'grid' ? "bg-blue-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <Grid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 transition-colors",
                                    viewMode === 'list' ? "bg-blue-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'my_products' && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                                >
                                    <div className="aspect-square bg-slate-100 flex items-center justify-center p-6">
                                        <Package className="h-16 w-16 text-slate-300" />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-slate-900 line-clamp-2 text-sm">{product.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">{product.sku}</p>
                                            </div>
                                            <Badge variant={product.approvalStatus === 'live' ? 'live' : product.approvalStatus === 'pending' ? 'pending' : 'rejected'} dot>
                                                {product.approvalStatus}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-lg font-bold text-slate-900">₹{product.price || product.mrp}</p>
                                            <p className="text-xs text-slate-500">Stock: {product.stockQuantity}</p>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                                            <button className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                                                <Eye className="h-4 w-4 mx-auto" />
                                            </button>
                                            <button className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                                                <Edit className="h-4 w-4 mx-auto" />
                                            </button>
                                            <button className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                <Trash2 className="h-4 w-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Price</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Stock</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                        <BookOpen className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                                                        <p className="text-xs text-slate-500">{product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default" className="capitalize">{product.category}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">₹{product.price || product.mrp}</td>
                                            <td className="px-6 py-4 text-right text-slate-700">{product.stockQuantity}</td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={product.approvalStatus === 'live' ? 'live' : product.approvalStatus === 'pending' ? 'pending' : 'rejected'}
                                                    dot
                                                >
                                                    {product.approvalStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className="py-16 text-center">
                            <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-lg font-medium text-slate-600">No products found</p>
                            <p className="mt-2 text-sm text-slate-500">Try a different search or category</p>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'add_new' && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <Plus className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-900">Add New School Product</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                        Add products specific to {school.name}. Products will be reviewed and approved before going live.
                    </p>
                    <Button className="mt-6">
                        <Plus className="h-4 w-4" />
                        Start Adding Product
                    </Button>
                </div>
            )}

            {activeTab === 'track_approvals' && (
                <div className="space-y-4">
                    {[
                        { id: 'ap1', name: 'NCERT Mathematics Class 10', status: 'under_review', submittedDate: '2024-01-15' },
                        { id: 'ap2', name: 'English Grammar Workbook', status: 'approved', submittedDate: '2024-01-12' },
                    ].map((request) => (
                        <div key={request.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                                    <BookOpen className="h-6 w-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{request.name}</p>
                                    <p className="text-sm text-slate-500">Submitted: {request.submittedDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {request.status === 'under_review' ? (
                                    <Badge variant="pending" dot>Under Review</Badge>
                                ) : (
                                    <Badge variant="approved" dot>Approved</Badge>
                                )}
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
