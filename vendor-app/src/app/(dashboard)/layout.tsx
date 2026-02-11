'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    GraduationCap,
    Package,
    ShoppingCart,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X,
    BookOpen,
    User,
    HelpCircle,
    Search,
    BarChart3,
    RotateCcw,
    XCircle,
    ClipboardList,
    Plus,
    CheckCircle,
    List,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    subItems?: { label: string; href: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
    {
        label: 'Overview',
        href: '/dashboard/overview',
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        label: 'My Schools',
        href: '/dashboard/inventory/schools',
        icon: <GraduationCap className="w-5 h-5" />,
        badge: 2,
        subItems: [
            { label: 'All Schools', href: '/dashboard/inventory/schools', icon: <List className="w-4 h-4" /> },
            { label: 'Manage Products', href: '/dashboard/inventory/schools/sch_001', icon: <Package className="w-4 h-4" /> },
        ],
    },
    {
        label: 'General Store',
        href: '/dashboard/inventory/general',
        icon: <Package className="w-5 h-5" />,
        subItems: [
            { label: 'My Products', href: '/dashboard/inventory/general', icon: <List className="w-4 h-4" /> },
            { label: 'Add Product', href: '/dashboard/inventory/general/add', icon: <Plus className="w-4 h-4" /> },
            { label: 'Track Approvals', href: '/dashboard/inventory/general/approvals', icon: <CheckCircle className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Inventory Health',
        href: '/dashboard/inventory/health',
        icon: <BarChart3 className="w-5 h-5" />,
        badge: 3,
    },
    {
        label: 'Orders',
        href: '/dashboard/orders',
        icon: <ShoppingCart className="w-5 h-5" />,
        badge: 4,
        subItems: [
            { label: 'Active Orders', href: '/dashboard/orders', icon: <ClipboardList className="w-4 h-4" /> },
            { label: 'Returns', href: '/dashboard/orders/returns', icon: <RotateCcw className="w-4 h-4" /> },
            { label: 'Cancellations', href: '/dashboard/orders/cancelled', icon: <XCircle className="w-4 h-4" /> },
        ],
    },
    {
        label: 'Notifications',
        href: '/dashboard/notifications',
        icon: <Bell className="w-5 h-5" />,
        badge: 3,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="w-5 h-5" />,
    },
];

// NavItem component to handle sub-menu positioning outside overflow context
function NavItem({ item, pathname }: { item: NavItem; pathname: string }) {
    const [menuPosition, setMenuPosition] = useState<{ top: number } | null>(null);
    const itemRef = React.useRef<HTMLLIElement>(null);

    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasSubItems = item.subItems && item.subItems.length > 0;

    const handleMouseEnter = () => {
        if (hasSubItems && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setMenuPosition({ top: rect.top });
        }
    };

    const handleMouseLeave = () => {
        setMenuPosition(null);
    };

    return (
        <li
            ref={itemRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
            >
                <span className={cn(
                    "flex-shrink-0",
                    isActive ? "text-blue-600" : "text-slate-400"
                )}>
                    {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                    <span
                        className={cn(
                            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                            isActive
                                ? "bg-blue-600 text-white"
                                : "bg-amber-100 text-amber-700"
                        )}
                    >
                        {item.badge}
                    </span>
                )}
            </Link>

            {/* Hover Dropdown Menu - positioned as popover outside sidebar scroll context */}
            {hasSubItems && menuPosition && (
                <div
                    className="fixed"
                    style={{
                        left: '240px', // Position right at sidebar edge (w-64 = 256px - 16px padding)
                        top: menuPosition.top,
                        zIndex: 9999
                    }}
                >
                    {/* Invisible bridge to maintain hover state when moving to sub-menu */}
                    <div
                        className="absolute"
                        style={{
                            left: '-24px',
                            top: 0,
                            width: '40px',
                            height: '100%',
                            background: 'transparent'
                        }}
                    />
                    <div className="pl-2">
                        <div className="w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-xl ring-1 ring-black/5">
                            {item.subItems!.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                    <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                            isSubActive
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "text-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        {subItem.icon && (
                                            <span className={cn(
                                                isSubActive ? "text-blue-600" : "text-slate-400"
                                            )}>
                                                {subItem.icon}
                                            </span>
                                        )}
                                        {subItem.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
}
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed to viewport height, never scrolls with page */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out overflow-visible",
                    "lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-200 px-6">
                    <Link href="/dashboard/overview" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">Bukizz</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <NavItem key={item.href} item={item} pathname={pathname} />
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-200 p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-sm">
                            RS
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                Rahul Sharma
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                Sharma Books
                            </p>
                        </div>
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    </div>
                    <button className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Offset by sidebar width on desktop */}
            <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden flex-1 md:flex">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products, orders..."
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-2">
                        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                            </span>
                        </button>
                        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                            <User className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
