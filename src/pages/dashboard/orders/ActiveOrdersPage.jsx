import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { mockOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
    Search, Filter, Download, Package, Truck,
    Clock, CheckCircle, GraduationCap, MapPin, Calendar,
} from 'lucide-react';

const statusCards = [
    { id: 'all', label: 'All Orders', icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'pending', label: 'Pending', icon: <Clock className="h-5 w-5" />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    { id: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="h-5 w-5" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { id: 'dispatched', label: 'Dispatched', icon: <Truck className="h-5 w-5" />, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
];

export default function ActiveOrdersPage() {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);

    const filteredOrders = mockOrders.filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const counts = {
        all: mockOrders.length,
        pending: mockOrders.filter(o => o.status === 'pending').length,
        confirmed: mockOrders.filter(o => o.status === 'confirmed').length,
        dispatched: mockOrders.filter(o => o.status === 'dispatched').length,
    };

    const toggleOrderSelection = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        setSelectedOrders(
            selectedOrders.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id)
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Active Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage and track your active orders</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
                    <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filters</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statusCards.map((card) => (
                    <button key={card.id} onClick={() => setSelectedStatus(card.id)}
                        className={cn("relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md",
                            selectedStatus === card.id ? `${card.bgColor} ${card.borderColor} shadow-md` : "bg-white border-slate-200"
                        )}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg",
                            selectedStatus === card.id ? card.bgColor : "bg-slate-100",
                            selectedStatus === card.id ? card.color : "text-slate-400"
                        )}>{card.icon}</div>
                        <div>
                            <span className="text-2xl font-bold text-slate-900">{counts[card.id]}</span>
                            <p className={cn("text-sm font-medium", selectedStatus === card.id ? card.color : "text-slate-600")}>{card.label}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex-1 max-w-md">
                <Input placeholder="Search by order ID or customer name..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="h-5 w-5" />} />
            </div>

            {selectedOrders.length > 0 && (
                <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                    <span className="text-sm font-medium text-blue-700">{selectedOrders.length} selected</span>
                    <Button variant="outline" size="sm">Mark as Confirmed</Button>
                    <Button variant="outline" size="sm">Print Labels</Button>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-left"><input type="checkbox" checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300" /></th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order Details</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Dispatch By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className={cn("transition-colors hover:bg-slate-50", selectedOrders.includes(order.id) && "bg-blue-50/50")}>
                                    <td className="px-6 py-4"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleOrderSelection(order.id)} className="h-4 w-4 rounded border-slate-300" /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", order.orderType === 'school_bundle' ? "bg-violet-100" : "bg-slate-100")}>
                                                {order.orderType === 'school_bundle' ? <GraduationCap className="h-5 w-5 text-violet-600" /> : <Package className="h-5 w-5 text-slate-400" />}
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-blue-600">{order.id}</p>
                                                <Badge variant={order.orderType === 'school_bundle' ? 'info' : 'default'} className="mt-1 text-xs">
                                                    {order.orderType === 'school_bundle' ? 'School Bundle' : 'General'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{order.shippingAddress?.city}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={order.status === 'pending' ? 'pending' : order.status === 'confirmed' ? 'approved' : 'info'} dot>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm text-slate-700">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="py-16 text-center">
                        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">No orders found</p>
                    </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <select className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"><option>10</option><option>25</option><option>50</option></select>
                        <span>Items per page</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{filteredOrders.length > 0 ? `1-${filteredOrders.length}` : '0-0'} of {filteredOrders.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
