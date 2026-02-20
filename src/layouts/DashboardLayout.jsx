import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  GraduationCap,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Menu,
  BarChart3,
  LogOut,
  Store,
  List,
  PlusCircle,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  XCircle,
  UserCog,
  Warehouse,
  ChevronRight,
  Wallet,
} from "lucide-react";
import WarehouseSwitcher from "@/components/dashboard/WarehouseSwitcher";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    label: "My Schools",
    href: "/dashboard/inventory/schools",
    icon: GraduationCap,
  },
  {
    label: "General Store",
    href: "/dashboard/inventory/general",
    icon: Store,
    subItems: [
      {
        label: "My Products",
        href: "/dashboard/inventory/general",
        icon: List,
      },
      {
        label: "Add Product",
        href: "/dashboard/inventory/general/add",
        icon: PlusCircle,
      },
      {
        label: "Track Approvals",
        href: "/dashboard/inventory/general/approvals",
        icon: CheckCircle2,
      },
    ],
  },
  {
    label: "Inventory Health",
    href: "/dashboard/inventory/health",
    icon: BarChart3,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    subItems: [
      {
        label: "Active Orders",
        href: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        label: "Returns",
        href: "/dashboard/orders/returns",
        icon: RotateCcw,
      },
      {
        label: "Cancellations",
        href: "/dashboard/orders/cancelled",
        icon: XCircle,
      },
    ],
  },
  {
    label: "Settlements",
    href: "/dashboard/settlements",
    icon: Wallet,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    subItems: [
      {
        label: "My Profile",
        href: "/dashboard/settings/profile",
        icon: UserCog,
      },
      {
        label: "Warehouses",
        href: "/dashboard/settings/warehouses",
        icon: Warehouse,
      },
    ],
  },
];

function NavItem({ item, pathname }) {
  const [hovered, setHovered] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (hasSubItems) {
      clearTimeout(timeoutRef.current);
      updatePosition();
      setHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasSubItems) {
      timeoutRef.current = setTimeout(() => setHovered(false), 150);
    }
  };

  const handlePopoverEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handlePopoverLeave = () => {
    timeoutRef.current = setTimeout(() => setHovered(false), 150);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={hasSubItems ? item.subItems[0].href : item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all duration-200",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            isActive ? "text-blue-600" : "text-slate-400",
          )}
        />
        <span className="flex-1">{item.label}</span>
        {hasSubItems && (
          <ChevronRight
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-200",
              isActive ? "text-blue-500" : "text-slate-400",
            )}
          />
        )}
      </Link>

      {/* Hover popover submenu — rendered via portal so it's never clipped */}
      {hasSubItems &&
        hovered &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{ top: popoverPos.top, left: popoverPos.left }}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
          >
            <div className="w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
              {item.subItems.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                return (
                  <Link
                    key={subItem.href}
                    to={subItem.href}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                      isSubActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <subItem.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isSubActive ? "text-blue-600" : "text-slate-400",
                      )}
                    />
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  // Derive initials and display name from the user object
  const displayName = user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out overflow-visible",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <img src="/logo.svg" alt="Bukizz Logo" className="h-9 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative hidden flex-1 md:flex">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, schools..."
              className="h-10 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <WarehouseSwitcher />
            {/* <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <HelpCircle className="h-5 w-5" />
            </button> */}
            <Link
              to="/dashboard/notifications"
              className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 ml-2 rounded-lg border border-slate-200 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {displayName.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
